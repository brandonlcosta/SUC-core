// utils/engineDefaults.js
// Wrapper to load engineDefaults.json with ESM support.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultsPath = path.join(__dirname, "../engineDefaults.json");

let defaults = {};
if (fs.existsSync(defaultsPath)) {
  const raw = fs.readFileSync(defaultsPath, "utf-8");
  defaults = JSON.parse(raw);
}

/**
 * Get default config for an engine by key
 * @param {string} key 
 * @returns {object} default config
 */
export function getDefault(key) {
  return defaults[key] || {};
}
