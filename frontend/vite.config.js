import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// proxy servers setup to solve the CORS issue
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // for refresh token api working
      '/auth': { // Proxy requests starting with /auth
        target: 'http://localhost:8000', // Django backend URL
        changeOrigin: true, // Needed for virtual hosting
        secure: false, // Don't check SSL certs for local development
      },
      // following 2 are for proper functioning of the chatting
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
      // to get the analytics
      '/analytics':{
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
    }
  }
})