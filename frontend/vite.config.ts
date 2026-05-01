import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

let IS_DEV = path.resolve(__dirname).includes("/ethan/");

let serverBlock = {};
if (IS_DEV) {
  console.log("is dev");
  serverBlock = {
    "/api": {
      target: "http://localhost:8001",
      changeOrigin: true
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/static/gameBuild/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: serverBlock
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
