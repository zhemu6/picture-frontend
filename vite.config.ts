import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 当前端请求 /api时  代理就转发到http://localhost:8123
  server:{
    host: '0.0.0.0', // 允许外部设备访问（局域网访问）
    port: 5173,      // 可选，指定端口，默认就是 5173
    proxy:{
      '/api': 'http://localhost:8123'
    }
  },

  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
