import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // 允许通过所有 IP 访问
    port: 8188,  // 修改为你想要的端口，比如 3000
    proxy: {
      '/api': 'http://192.168.1.175:8000',  // 将所有 /api 请求代理到后端
    },
    watch: {
      ignored: ['**/.idea/**', '**/node_modules/**']
    }
  },
})