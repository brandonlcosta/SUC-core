// File: frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@configs": path.resolve(__dirname, "./configs"),
      "@studio": path.resolve(__dirname, "./studio"),
      "@assets": path.resolve(__dirname, "./assets"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
