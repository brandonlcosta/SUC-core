// File: scripts/syncOutputs.js

import fs from "fs-extra";
import path from "path";

// Always resolve relative to repo root (../ from frontend/)
const repoRoot = path.resolve(process.cwd(), "..");

const rootOutputs = path.join(repoRoot, "outputs/broadcast");
const backendAssets = path.join(repoRoot, "backend/assets_ready");
const frontendOutputs = path.join(repoRoot, "frontend/public/outputs/broadcast");
const frontendAssets = path.join(repoRoot, "frontend/public/assets");

console.log("🔍 rootOutputs:", rootOutputs);
console.log("🔍 frontendOutputs:", frontendOutputs);

fs.ensureDirSync(frontendOutputs);
fs.ensureDirSync(frontendAssets);

// Clean old
fs.emptyDirSync(frontendOutputs);
fs.emptyDirSync(frontendAssets);

// Copy fresh
if (fs.existsSync(rootOutputs)) {
  fs.copySync(rootOutputs, frontendOutputs, { overwrite: true });
  console.log("✅ Synced outputs:", fs.readdirSync(frontendOutputs));
} else {
  console.warn("⚠️ No outputs found at:", rootOutputs);
}

if (fs.existsSync(backendAssets)) {
  fs.copySync(backendAssets, frontendAssets, { overwrite: true });
  console.log("✅ Synced assets:", fs.readdirSync(frontendAssets));
}
