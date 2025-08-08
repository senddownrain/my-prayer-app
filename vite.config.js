// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    // Плагин для Vue, с обязательной трансформацией для Vuetify
    vue({ 
      template: { transformAssetUrls }
    }),

    // Плагин для Vuetify 3, с автоматическим импортом компонентов
    vuetify({
      autoImport: true,
    }),

    // Плагин для Progressive Web App (PWA)
    VitePWA({
      // Стратегия обновления: сервис-воркер будет обновляться автоматически в фоне
      registerType: 'autoUpdate',
      
      // Включаем регистрацию сервис-воркера
      injectRegister: 'auto',

      workbox: {
        // Эта опция критически важна: она удаляет старые кэши при обновлении
        cleanupOutdatedCaches: true,
        // Указываем, какие файлы нужно кэшировать для оффлайн-работы
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
      },

      // Манифест вашего приложения
      manifest: {
        name: 'Мае малітвы', // Полное название приложения
        short_name: 'Малітвы', // Короткое название для иконки
        description: 'Личный сборник молитв и заметок',
        theme_color: '#1867C0', // Цвет верхней панели в Android (взят из вашего App.vue)
        background_color: '#ffffff', // Цвет сплэш-скрина при запуске
        display: 'standalone', // Приложение открывается без интерфейса браузера
        start_url: '.', // Стартовый URL
        // Убедитесь, что эти иконки лежат в папке /public
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Добавлено для лучших иконок в Android
          }
        ]
      }
    })
  ],

  // Настройка псевдонима '@' для удобного импорта из папки /src
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});