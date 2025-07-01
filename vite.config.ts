import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/open-projects': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/me': 'http://localhost:8000',
      '/notes': 'http://localhost:8000',
      '/groups': 'http://localhost:8000',
      '/github': 'http://localhost:8000',
      '/contributors': 'http://localhost:8000',
      '/tags': 'http://localhost:8000',
      '/contents': 'http://localhost:8000',
      '/messages': 'http://localhost:8000',
      '/blockchain-records': 'http://localhost:8000',
      '/stats': 'http://localhost:8000',
      '/reviews': 'http://localhost:8000',
      '/review-requests': 'http://localhost:8000',
      // 可根据实际后端API补充其它前缀
    }
  }
}); 