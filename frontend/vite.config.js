// File: frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@studio": path.resolve(__dirname, "frontend/studio"),
    },
  },
});

import stylesCfg from "@configs/styles.json";
import endpoints from "@configs/endpoints.json";
import { positionsToGeoJSON, zonesToGeoJSON } from "@/utils/geo.js";
