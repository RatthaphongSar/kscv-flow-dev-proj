
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: true, // Enable sourcemap for debugging
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor'
            }
            if (id.includes('socket.io')) {
              return 'socket-vendor'
            }
            if (id.includes('slick-carousel')) {
              return 'ui-vendor'
            }
            return 'vendor'
          }
          // Feature chunks
          if (id.includes('ChatWidget') || id.includes('ChatWindow')) {
            return 'chat'
          }
          if (id.includes('AssistantWidget')) {
            return 'assistant'
          }
          if (id.includes('AdminPanel') || id.includes('UserManagement')) {
            return 'admin'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Warn if chunk > 600kb
    reportCompressedSize: true,
  },
  server: { 
    port: 5173,
    strictPort: true // บังคับใช้พอร์ต 5173 เท่านั้น
  }
})