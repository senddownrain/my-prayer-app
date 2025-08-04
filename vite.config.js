import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
// ✅ 1. Импортируем утилиты для работы с путями из Node.js
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // ... секция PWA остается без изменений ...
    })
  ],
  resolve: {
    alias: {
      // ✅ 2. Используем НОВЫЙ синтаксис для определения псевдонима '@'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})