import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Плагин для PWA
    VitePWA({
      // Эта опция автоматически обновляет Service Worker при обнаружении новой версии
      registerType: 'autoUpdate',
      // Включаем генерацию манифеста
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        // Название вашего приложения
        name: 'Мои Молитвы',
        // Короткое название для домашнего экрана
        short_name: 'Молитвы',
        description: 'Личный сборник молитв и заметок',
        // Цвет фона для сплэш-скрина
        background_color: '#ffffff',
        // Основной цвет приложения (для статус-бара и т.д.)
        theme_color: '#1867C0', // Это основной синий цвет Vuetify
        // Иконки, которые мы создали
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
          // Иконка с маской для Android
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})