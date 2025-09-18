// File: tests/schemaValidator.js

import fs from "fs";
import path from "path";
import * as schemaGate from "../backend/services/schemaGate.js";

const outputsDir = path.resolve("./backend/outputs/broadcast");

console.log("🔍 Running schema validation on outputs...");

let allValid = true;

for (const schemaName of ["scoring", "meta", "story", "broadcastTick", "recap", "daily"]) {
  const filePath =
    schemaName === "broadcastTick"
      ? path.join(outputsDir, "overlays.json")
      : path.join(outputsDir, `${schemaName}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing output file for ${schemaName}: ${filePath}`);
    allValid = false;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

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
} else {
  console.error("❌ Schema validation failed for one or more outputs.");
  process.exit(1);
}
