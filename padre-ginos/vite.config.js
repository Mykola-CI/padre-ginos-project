import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

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
      "/public": {
        target: process.env.VITE_API_URL || "http://localhost:3000", // Use environment variable or fallback to localhost
        changeOrigin: true,
      },
    },
  },
  plugins: [TanStackRouterVite(), react()],
});
