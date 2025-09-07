import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'YoControlo',
        short_name: 'YoControlo',
        description: 'App para gestionar tus pagos y finanzas personales',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/image/dinero128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/image/dinero256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/image/dinero512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
