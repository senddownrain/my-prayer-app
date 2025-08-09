// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    vue({ 
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true,
    }),
    VitePWA({
      registerType: 'prompt', 
      injectRegister: 'auto',
      workbox: {
        cleanupOutdatedCaches: true,
        // ✅ ИЗМЕНЕНИЕ: Добавляем .webmanifest в список кэшируемых файлов
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2,webmanifest}'],
      },
      // ✅ ИЗМЕНЕНИЕ: Указываем новое имя файла манифеста
      manifestFilename: 'manifest.webmanifest',
      manifest: {
        name: 'Мае малітвы',
        short_name: 'Малітвы',
        description: 'Личный сборник молитв и заметок',
        theme_color: '#1867C0',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
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
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});