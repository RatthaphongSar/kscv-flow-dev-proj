
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173,
    strictPort: true // บังคับใช้พอร์ต 5173 เท่านั้น
  }
})