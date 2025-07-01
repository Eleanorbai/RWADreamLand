import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 认证相关路由 (使用/api前缀)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      // 业务路由 (无前缀)
      '/open-projects': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/notes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/groups': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/github': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/contributors': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/tags': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/contents': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/messages': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/blockchain-records': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/stats': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/reviews': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/review-requests': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
})