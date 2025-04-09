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
      '/api/v1': { // 修改代理监听路径为 /api/v1
        target: 'http://localhost:3000', // 后端 API 服务器地址
        changeOrigin: true,
        // 移除 rewrite 规则，因为源和目标基础路径现在一致了
        // rewrite: (path) => path.replace(/^\/api/, '/api/v1') 
      },
    }
  }
}) 