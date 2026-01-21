import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      recharts: 'recharts/es6',
    },
  },
  optimizeDeps: {
    include: ['recharts'],
  },
  ssr: {
    noExternal: ['recharts'],
  },
  build: {
    commonjsOptions: {
      include: [/recharts/, /node_modules/],
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '..', 'backend', 'certs', 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '..', 'backend', 'certs', 'localhost.pem')),
    },
  },
});
