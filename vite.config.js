import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // 确保引入 path

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 确保 "@" 指向 "src" 目录
    },
  },
  server: {
    host: '0.0.0.0', // 允许通过所有 IP 访问
    port: 8188, // 修改为你想要的端口，比如 3000
    proxy: {
      '/api': {
        target: 'http://192.168.1.175:8000', // 将所有 /api 请求代理到后端
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 去掉 "/api" 前缀
      },
    },
    watch: {
      ignored: ['**/.idea/**', '**/node_modules/**'] // 忽略不必要的路径
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // 将第三方库打包成 vendor.js
          }
        }
      }
    },
    cssCodeSplit: true, // 将 CSS 单独拆分为文件
  }
});