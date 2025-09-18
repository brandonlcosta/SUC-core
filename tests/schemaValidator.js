// File: tests/schemaValidator.js

import fs from "fs";
import path from "path";
import { validateAll } from "../backend/services/schemaGate.js";

/**
 * Load context outputs from /backend/outputs/broadcast
 * Validate against schemas
 */
async function main() {
  const outputsDir = path.resolve("./backend/outputs/broadcast");

  const ctx = {};

  // Load known outputs if they exist
  const files = {
    broadcast: "overlays.json",
    recap: "recap.json",
    daily: "daily.json",
    roster: "roster.json"
  };

  for (const [key, file] of Object.entries(files)) {
    const filePath = path.join(outputsDir, file);
    if (fs.existsSync(filePath)) {
      ctx[key] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  }

  console.log("🔍 Running schema validation on outputs...");
  try {
    validateAll(ctx);
    console.log("✅ All outputs passed schema validation.");
  } catch (err) {
    console.error("❌ Schema validation failed:", err.message);
    process.exit(1);
  }
}

main();
