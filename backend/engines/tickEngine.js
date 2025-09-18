// File: backend/engines/tickEngine.js
// Validates, writes, and ledger-logs each broadcast tick.

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";
import { appendTick } from "../services/LedgerService.js";

const SCHEMA_PATH = path.resolve("./backend/schemas/broadcastTick.schema.json");
const OUT_DEMO_DIR = path.resolve("./outputs/broadcast/demo");
const OUT_LATEST = path.join(OUT_DEMO_DIR, "latest.json");
const OP_OVERRIDES = path.resolve("./outputs/broadcast/operator_overrides.json");
const STATE_DEFAULTS_CANDIDATES = [
  path.resolve("./backend/configs/stateDefaults.json"),
  path.resolve("./configs/stateDefaults.json")
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
  const state = readFirstExisting(STATE_DEFAULTS_CANDIDATES, {});
  const overrides = readJSON(OP_OVERRIDES, {
    skip_bumper: null,
    pinned_arc: null,
    replay: null,
    muted_roles: []
  });

  return {
    ts: Date.now(),
    mode: { current: state?.mode?.current ?? "backyard_ultra" },
    ticker: partials.ticker ?? "",
    hud: partials.hud ?? {},
    highlights: Array.isArray(partials.highlights) ? partials.highlights : [],
    recap: partials.recap ?? {},
    operator_overrides: overrides,
    overlays: Array.isArray(partials.overlays) ? partials.overlays : [] // ✅ map overlays, trails, checkpoints, zones
  };
}

/**
 * Validate, persist, and ledger-log a broadcast tick.
 */
export function emitTick(partials) {
  const tick = buildBroadcastTick(partials);

  const valid = validateAgainstSchema(SCHEMA_PATH, tick);
  if (!valid) {
    console.error("❌ TickEngine: schema validation failed for broadcastTick");
    return null;
  }

  const seq = String(tick.ts);
  const numberedPath = path.join(OUT_DEMO_DIR, `tick-${seq}.json`);

  // Write tick to disk
  fs.writeFileSync(numberedPath, JSON.stringify(tick, null, 2));
  fs.writeFileSync(OUT_LATEST, JSON.stringify(tick, null, 2));
  console.log(`🟢 Tick written → ${OUT_LATEST}`);

  // Ledger log
  appendTick(tick);

  // Return normalized broadcast object
  return {
    type: "BROADCAST_TICK",
    payload: tick
  };
}
