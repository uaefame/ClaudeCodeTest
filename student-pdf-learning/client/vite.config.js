import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.DOCKER ? 'http://server:5001' : 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
