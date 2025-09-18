// File: frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ must use relative import here
import styles from "./configs/styles.json" with { type: "json" };

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@configs": path.resolve(__dirname, "./configs"),
      "@studio": path.resolve(__dirname, "./studio"),
      "@assets": path.resolve(__dirname, "./assets"),
    },
  },
  define: {
    // make styles.json available in your app
    APP_STYLES: styles,
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
