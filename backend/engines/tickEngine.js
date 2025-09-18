// File: backend/engines/tickEngine.js
// Validates, writes, and ledger-logs each broadcast tick.

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";
import { appendTick } from "../services/ledgerService.js";

const SCHEMA_PATH = path.resolve("./backend/schemas/broadcastTick.schema.json");
const OUT_DEMO_DIR = path.resolve("./outputs/broadcast/demo");
const OUT_LATEST = path.join(OUT_DEMO_DIR, "latest.json");
const OP_OVERRIDES = path.resolve("./outputs/broadcast/operator_overrides.json");
const STATE_DEFAULTS_CANDIDATES = [
  path.resolve("./backend/configs/stateDefaults.json"),
  path.resolve("./configs/stateDefaults.json"),
];

// Ensure output directory exists
fs.mkdirSync(OUT_DEMO_DIR, { recursive: true });

function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function readFirstExisting(paths, fallback) {
  for (const p of paths) {
    if (fs.existsSync(p)) return readJSON(p, fallback);
  }
  return fallback;
}

/**
 * Build a broadcastTick object from partials + defaults + operator overrides.
 */
export function buildBroadcastTick(partials = {}) {
  const defaults = readFirstExisting(STATE_DEFAULTS_CANDIDATES, {});
  const overrides = readJSON(OP_OVERRIDES, {});
  return {
    ...defaults,
    ...partials,
    ...overrides,
    timestamp: Date.now(),
  };
}

/**
 * Run tick engine: validate, write, and log
 */
export function runTickEngine(partials = {}) {
  const tick = buildBroadcastTick(partials);

  const valid = validateAgainstSchema(SCHEMA_PATH, tick);
  if (!valid) {
    console.error("❌ TickEngine schema validation failed");
    return null;
  }

  fs.writeFileSync(OUT_LATEST, JSON.stringify(tick, null, 2));
  appendTick(tick);
  console.log(`⏱️ TickEngine wrote ${OUT_LATEST}`);

  return tick;
}

// ✅ Default export for clean imports
export default {
  buildBroadcastTick,
  runTickEngine,
};
