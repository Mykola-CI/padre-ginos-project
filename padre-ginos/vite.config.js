// padre-ginos/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes', // Explicitly define routes directory
      generatedRouteTree: './src/routeTree.gen.ts', // Explicit output path
    }),
    react()
  ],
  base: '/padre-ginos-react/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true, 
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
