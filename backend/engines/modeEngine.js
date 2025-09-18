// File: backend/engines/modeEngine.js
// Reducer: loads ruleset config → mode.json

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";
import { modeLoader } from "../modeLoader.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/mode.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/mode.schema.json");

/**
 * Reducer: load active ruleset config
 * @param {Array<Object>} events
 * @returns {Object} mode config
 */
export function modeReducer(events = []) {
  // Pick modeId from events (default turfWars)
  const modeId = events.find((e) => e.modeId)?.modeId || "turfWars";
  const ruleset = modeLoader(modeId);

  return {
    modeId,
    ruleset,
    loaded_at: Date.now(),
  };
}

/**
 * Run mode engine and persist output
 * @param {Array<Object>} events
 * @returns {Object|null} mode config
 */
export function runModeEngine(events = []) {
  const mode = modeReducer(events);

  const valid = validateAgainstSchema(SCHEMA_PATH, mode);
  if (!valid) {
    console.error("❌ ModeEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mode, null, 2));
  console.log(`🎮 ModeEngine wrote ${OUTPUT_PATH}`);

  return mode;
}

// ✅ Default export for clean imports
export default {
  modeReducer,
  runModeEngine,
};
