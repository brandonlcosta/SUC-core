// File: frontend/vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Vite config for SUC Studio
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
});
