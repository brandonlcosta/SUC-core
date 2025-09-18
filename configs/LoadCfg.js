// File: loadCfg.js
import fs from "fs";
import path from "path";

export function loadCfg(fileName) {
  const filePath = path.resolve("./configs", fileName);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`⚠️ Failed to load config: ${fileName}`, err);
    return {};
  }
}
