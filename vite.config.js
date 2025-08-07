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
        // Эта опция критически важна: она удаляет старые кэши при обновлении,
        // что помогает при смене иконок и других ассетов.
        cleanupOutdatedCaches: true,
        
        // Указываем, какие файлы нужно кэшировать для оффлайн-работы
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
      },

      // Манифест вашего приложения
      manifest: {
        name: 'Мае малітвы', // Полное название приложения
        short_name: 'Малітвы', // Короткое название для иконки
        description: 'Личный сборник молитв и заметок',
        theme_color: '#ffffff', // Цвет верхней панели в Android
        background_color: '#ffffff', // Цвет сплэш-скрина при запуске
        display: 'standalone', // Приложение открывается без интерфейса браузера
        start_url: '.', // Стартовый URL
        
        // Здесь должны быть пути к вашим ИКОНКАМ в папке /public
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
          // Вы можете добавить и другие размеры, например, для маскируемых иконок
        
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