// File: scripts/watchPipeline.js

import chokidar from "chokidar";
import fs from "fs-extra";
import path from "path";

// ✅ FIXED: point to root-level outputs
const rootOutputs = path.resolve("outputs/broadcast");
const backendAssets = path.resolve("backend/assets_ready");
const frontendOutputs = path.resolve("frontend/public/outputs/broadcast");
const frontendAssets = path.resolve("frontend/public/assets");

fs.ensureDirSync(frontendOutputs);
fs.ensureDirSync(frontendAssets);

async function initialSync() {
  if (fs.existsSync(rootOutputs)) {
    await fs.copy(rootOutputs, frontendOutputs, { overwrite: true });
    const files = fs.readdirSync(rootOutputs);
    console.log(`✅ Initial sync copied ${files.length} outputs:`, files);
  } else {
    console.warn("⚠️ No root outputs found at:", rootOutputs);
  }

  if (fs.existsSync(backendAssets)) {
    await fs.copy(backendAssets, frontendAssets, { overwrite: true });
    const files = fs.readdirSync(backendAssets);
    console.log(`✅ Initial sync copied ${files.length} assets:`, files);
  }
}

function watchAndSync(source, target, label) {
  if (!fs.existsSync(source)) {
    console.warn(`⚠️ Watch path not found: ${source}`);
    return;
  }

  chokidar.watch(source, { persistent: true, ignoreInitial: true }).on("all", (event, filePath) => {
    const fileName = path.basename(filePath);
    const destPath = path.join(target, fileName);

    if (event === "add" || event === "change") {
      fs.copy(filePath, destPath)
        .then(() => console.log(`🔄 Synced ${label}: ${fileName}`))
        .catch((err) => console.error(`❌ Error syncing ${fileName}:`, err));
    } else if (event === "unlink") {
      fs.remove(destPath)
        .then(() => console.log(`❌ Removed ${label}: ${fileName}`))
        .catch((err) => console.error(`❌ Error removing ${fileName}:`, err));
    }
  });
}

await initialSync();
watchAndSync(rootOutputs, frontendOutputs, "output");
watchAndSync(backendAssets, frontendAssets, "asset");

console.log("👀 Watching root outputs & backend assets for live sync...");
process.stdin.resume();
