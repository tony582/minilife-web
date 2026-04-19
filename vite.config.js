import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api':     'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000',  // 上传的附件文件
      '/assets':  'http://127.0.0.1:3000',   // QR码等静态资源
    }
  }
})
