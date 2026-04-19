import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-bundle these packages so they are NOT re-processed on every request
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      '@dicebear/core', '@dicebear/miniavs',
    ],
  },
  server: {
    proxy: {
      '/api':     'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000',
      '/assets':  'http://127.0.0.1:3000',
    },
    // Pre-transform hot-path files so first request over WiFi is instant
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/utils/Icons.jsx',
        './src/context/AuthContext.jsx',
        './src/context/DataContext.jsx',
        './src/context/UIContext.jsx',
        './src/hooks/useAppData.js',
        './src/hooks/useAuth.js',
        './src/api/client.js',
      ],
    },
  }
})
