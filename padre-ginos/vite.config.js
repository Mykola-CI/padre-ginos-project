import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  server: {
    fs: {
      allow: [".."],
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3000", // Use environment variable or fallback to localhost
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist", // Specify the output directory for the build (default is "dist")
    sourcemap: true, // Optional: Generate source maps for debugging
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src')
        },
      // Optional: Customize Rollup bundling
      output: {
        manualChunks: undefined, // Example: Customize chunk splitting
      },
    },
  },
  plugins: [TanStackRouterVite(), react()],
});
