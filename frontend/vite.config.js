
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
  server: { 
    port: 5173,
    strictPort: true // บังคับใช้พอร์ต 5173 เท่านั้น
  }
})