import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { TanStackRouterVite } from '@tanstack/router-plugin';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: './src/routes', // Directory where your route files are located
      generatedRouteTree: './src/routeTree.gen.ts', // Path where the route tree will be generated
    }),
  ],
  server: {
    port: 10000, // Frontend development server runs on port 10000
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000', // Backend API proxy
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
