// File: tests/schemaValidator.js

import fs from "fs";
import path from "path";
import * as schemaGate from "../backend/services/schemaGate.js";

const outputsDir = path.resolve("./backend/outputs/broadcast");

// ✅ Map schema names → file names
const schemaFiles = {
  scoring: "scoring.json",
  meta: "meta.json",
  story: "story.json",
  broadcastTick: "overlays.json",
  recap: "recap.json",
  daily: "daily.json",
  spatial: "spatial.json"
};

console.log("🔍 Running schema validation on outputs...");

let allValid = true;

for (const [schemaName, fileName] of Object.entries(schemaFiles)) {
  const filePath = path.join(outputsDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing output file for ${schemaName}: ${filePath}`);
    allValid = false;
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let data;

  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Failed to parse JSON for ${schemaName}: ${filePath}`);
    console.error("⚠️ Raw contents:", raw);
    allValid = false;
    continue;
  }

  try {
    schemaGate.validate(schemaName, data);
  } catch (err) {
    console.error(`[schemaGate] Validation failed for ${schemaName}:`);
    console.error(err.errors || err.message);
    console.error("⚠️ File contents:", JSON.stringify(data, null, 2));
    allValid = false;
  }
}

if (allValid) {
  console.log("✅ All outputs passed schema validation.");
  process.exit(0);
} else {
  console.error("❌ Schema validation failed for one or more outputs.");
  process.exit(1);
}
