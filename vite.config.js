import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/restaurants': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/customers': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/visits': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/badges': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/pointsWallets': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/reviews': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/rewards': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/dishes': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/employees': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/rewardRedemptions': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/statistics': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/dish-ratings': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
})
