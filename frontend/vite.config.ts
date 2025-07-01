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
      '/api': {
        target: 'http://localhost:8000', // 你的 FastAPI 后端地址
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
})

