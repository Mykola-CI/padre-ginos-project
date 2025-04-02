import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  base: '/padre-ginos-react/', // Set this to your repository name
  plugins: [
    react(),
    TanStackRouterVite({
      target: 'react', // Specify React as the target framework
      autoCodeSplitting: true, // Enable automatic code splitting for routes
      routesDirectory: './src/routes', // Directory where your route files are located
      generatedRouteTree: './src/routeTree.gen.ts', // Path where the route tree will be generated
    }),
  ],
  server: {
    port: 10000,
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    } : undefined,
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
