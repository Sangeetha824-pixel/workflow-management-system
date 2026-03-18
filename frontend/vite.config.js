import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/users': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/workflows': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/steps': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/rules': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/executions': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/stats': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    }
  }
})