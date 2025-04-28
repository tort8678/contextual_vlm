import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { hash } from './src/utils/functions'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({registerType: 'autoUpdate'})
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  //test out whether this makes it so I don't need to hard refresh after update to see changes
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name]` + hash + `.js`,
        chunkFileNames: `[name]` + hash + `.js`,
        assetFileNames: `[name]` + hash + `.[ext]`
      }
    }
  }

})
