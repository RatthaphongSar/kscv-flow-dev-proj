#!/usr/bin/env node

/**
 * Production-like HTTPS Development Server
 * Supports Hot Module Replacement (HMR) for live editing
 * 
 * Usage:
 *   node server.js          - Start server on port 443 (requires admin)
 *   node server.js 3000     - Start server on port 3000
 * 
 * Access: https://localhost:3000
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import express from 'express';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get port from command line or use default
const PORT = process.argv[2] ? parseInt(process.argv[2]) : 3000;
const HOST = 'localhost';

// Paths
const certDir = path.join(__dirname, '..', 'backend', 'certs');
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'dist');

// Check if dist folder exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ folder not found!');
  console.error('   Run: npm run build');
  process.exit(1);
}

// Create Express app
const app = express();

// Enable compression
app.use(compression());

// Middleware: Serve static files with cache headers
app.use(express.static(distDir, {
  maxAge: '1h',
  etag: false,
  setHeaders: (res, path) => {
    // Assets with hash should be cached for long time
    if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // HTML files should not be cached
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Middleware: API proxy (if backend running)
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001', // Backend API port
  changeOrigin: true,
  logLevel: 'info',
  onProxyRes: (proxyRes) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  },
  onError: (err, req, res) => {
    console.log('⚠️  Backend not available, using mock data');
  }
}));

// Middleware: SPA fallback - serve index.html for all routes
app.use((req, res, next) => {
  // If the request is for a file with an extension, skip
  if (path.extname(req.path)) return next();
  // Otherwise serve index.html for SPA routing
  res.sendFile(path.join(distDir, 'index.html'));
});

// Load HTTPS certificates
let options = {};
try {
  if (fs.existsSync(path.join(certDir, 'localhost.pem')) && 
      fs.existsSync(path.join(certDir, 'localhost-key.pem'))) {
    options = {
      key: fs.readFileSync(path.join(certDir, 'localhost-key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'localhost.pem'))
    };
    console.log('✅ HTTPS certificates loaded');
  } else {
    console.warn('⚠️  HTTPS certificates not found, using HTTP only');
  }
} catch (err) {
  console.warn('⚠️  Could not load certificates:', err.message);
}

// Create HTTPS or HTTP server
const server = Object.keys(options).length > 0 
  ? https.createServer(options, app)
  : http.createServer(app);

// Start server
server.listen(PORT, HOST, () => {
  const protocol = Object.keys(options).length > 0 ? 'https' : 'http';
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🚀 Production-like Development Server                 ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  URL: ${protocol}://${HOST}:${PORT}`.padEnd(57) + '║');
  console.log('║                                                        ║');
  console.log('║  📁 Serving: dist/ (built production files)            ║');
  console.log('║  🔄 Hot Reload: Edit src/ → npm run build → Refresh   ║');
  console.log('║  🔗 API: http://localhost:3001 (if backend running)    ║');
  console.log('║                                                        ║');
  console.log('║  Commands:                                             ║');
  console.log('║  • npm run build  - Build for production               ║');
  console.log('║  • npm run dev    - Development mode (hot reload)      ║');
  console.log('║  • node server.js 8080 - Change port                  ║');
  console.log('║                                                        ║');
  console.log('║  Press Ctrl+C to stop server                           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n');
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`   Try: node server.js ${PORT + 1}`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✋ Stopping server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
  
  // Force exit after 5 seconds
  setTimeout(() => {
    console.error('⚠️  Force shutdown');
    process.exit(1);
  }, 5000);
});

// Unhandled errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  process.exit(1);
});
