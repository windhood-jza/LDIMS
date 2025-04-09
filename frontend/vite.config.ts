import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 引入 path 模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: { // 添加 resolve 配置
    alias: {
      '@': path.resolve(__dirname, './src'), // 设置 @ 指向 src 目录
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端 API 服务器地址
        changeOrigin: true,
      },
    }
  }
}) 