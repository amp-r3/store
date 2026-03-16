import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { webfontDownload } from 'vite-plugin-webfont-dl'
import {browserslistToTargets} from 'lightningcss';
import browserslist from 'browserslist';

export default defineConfig({
  plugins: [react(), webfontDownload()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%'))
    }
  },
  build: {
    cssMinify: 'lightningcss'
  }
})