import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/hexgame/static/gameBuild'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Removes hashes from main entry files
        entryFileNames: `assets/[name].js`,
        // Removes hashes from split code chunks
        chunkFileNames: `assets/[name].js`,
        // Removes hashes from CSS and other static assets
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
