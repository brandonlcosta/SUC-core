// File: backend/utils/paths.js

import path from "path";
import fs from "fs";

export const OUTPUT_DIR = path.resolve(process.cwd(), "backend/outputs/broadcast");

export function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  return OUTPUT_DIR;
}
