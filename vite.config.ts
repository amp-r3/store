import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { webfontDownload } from 'vite-plugin-webfont-dl'

export default defineConfig({
  plugins: [react(), webfontDownload()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})