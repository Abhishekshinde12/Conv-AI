import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      '/auth': { // Proxy requests starting with /auth
        target: 'http://localhost:8000', // Your Django backend URL
        changeOrigin: true, // Needed for virtual hosting
        secure: false, // Don't check SSL certs for local development
      },
      '/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
'/ws': {
  target: 'ws://localhost:8000',
  changeOrigin: true,
  secure: false,
  ws: true,
},
    }
  }
})