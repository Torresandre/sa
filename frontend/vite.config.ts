import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['content-security-policy']
            delete proxyRes.headers['strict-transport-security']
            delete proxyRes.headers['x-frame-options']
            delete proxyRes.headers['x-content-type-options']
          })
        },
      },
    },
  },
})
