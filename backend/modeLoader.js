// /backend/modeLoader.js
// Loads active ruleset JSON from /configs/rulesets.json

import fs from "fs";
import path from "path";

const RULESETS_PATH = path.resolve("./configs/rulesets.json");

export function modeLoader(modeKey) {
  if (!fs.existsSync(RULESETS_PATH)) {
    throw new Error(`❌ Failed to load rulesets.json at ${RULESETS_PATH}`);
  }

  const registry = JSON.parse(fs.readFileSync(RULESETS_PATH, "utf-8"));
  const relPath = registry[modeKey];

  if (!relPath) {
    throw new Error(`❌ No ruleset found for mode "${modeKey}" in rulesets.json`);
  }

  const rulesetPath = path.resolve("./configs", relPath);
  if (!fs.existsSync(rulesetPath)) {
    throw new Error(`❌ Ruleset file not found at ${rulesetPath}`);
  }

  const ruleset = JSON.parse(fs.readFileSync(rulesetPath, "utf-8"));
  return ruleset;
}

export default modeLoader;
