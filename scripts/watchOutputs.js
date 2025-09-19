// File: scripts/watchOutputs.js
//
// Watches /backend/outputs/broadcast and mirrors into frontend/public/outputs/broadcast

import chokidar from "chokidar";
import fs from "fs-extra";
import path from "path";

const backendDir = path.resolve("backend/outputs/broadcast");
const frontendDir = path.resolve("frontend/public/outputs/broadcast");

// Ensure target folder exists
fs.ensureDirSync(frontendDir);

// Initial copy on startup
fs.copySync(backendDir, frontendDir, { overwrite: true });
console.log("✅ Initial sync complete.");

// Watch for changes
chokidar.watch(backendDir, { persistent: true }).on("all", (event, filePath) => {
  if (!filePath.endsWith(".json")) return;

  const fileName = path.basename(filePath);
  const destPath = path.join(frontendDir, fileName);

  if (event === "add" || event === "change") {
    fs.copySync(filePath, destPath, { overwrite: true });
    console.log(`🔄 Synced: ${fileName}`);
  } else if (event === "unlink") {
    fs.removeSync(destPath);
    console.log(`❌ Removed: ${fileName}`);
  }
});
