import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: true, // Needed for docker
    proxy: {
      // Rediriger les requêtes /api vers le serveur Express en développement
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    // Pas de restriction d'hôtes
    port: process.env.PORT || 4173,
    proxy: {
      // Rediriger les requêtes /api vers le serveur Express en production
      '/api': {
        target: process.env.API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    // Nécessaire pour certaines libs qui utilisent process.env
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }
});