import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/static/gameBuild/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/hexgame/static/gameBuild/'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Removes hashes from main entry files
        entryFileNames: `[name].js`,
        // Removes hashes from split code chunks
        chunkFileNames: `[name].js`,
        // Removes hashes from CSS and other static assets
        assetFileNames: `[name].[ext]`
      }
    }
  }
})
