// File: vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "frontend"),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    hmr: { overlay: true }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/studio"),
      "@configs": path.resolve(__dirname, "frontend/configs")
    }
  }
});
