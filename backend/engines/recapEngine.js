// /backend/engines/recapEngine.js
// Reducer: transforms tick history into recap.json

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/Recaps/recap.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/recap.schema.json");

/**
 * Reducer: build recap object from event ticks
 * @param {Array<Object>} ticks - history of event ticks
 * @returns {Object} recap
 */
export function recapReducer(ticks = []) {
  const lapCounts = new Map();
  const dnfLog = [];
  const highlightReel = [];

  ticks.forEach((tick) => {
    // Collect laps
    if (Array.isArray(tick.laps)) {
      tick.laps.forEach(({ athleteId }) => {
        if (!athleteId) return;
        lapCounts.set(athleteId, (lapCounts.get(athleteId) || 0) + 1);
      });
    }

    // Collect DNFs
    if (Array.isArray(tick.dnfs)) {
      tick.dnfs.forEach(({ athleteId, timestamp }) => {
        if (!athleteId) return;
        dnfLog.push({ athleteId, timestamp: timestamp || Date.now() });
      });
    }

    // Collect rivalries / highlights
    if (Array.isArray(tick.rivalries)) {
      tick.rivalries.forEach((r) => {
        highlightReel.push({
          type: "rivalry",
          athletes: r.athletes,
          timestamp: r.timestamp || Date.now(),
        });
      });
    }

    if (tick.streak) {
      highlightReel.push({ type: "streak", ...tick.streak });
    }
    if (tick.comeback) {
      highlightReel.push({ type: "comeback", ...tick.comeback });
    }
  });

  const recap = {
    laps_summary: Array.from(lapCounts.entries()).map(([athleteId, laps]) => ({
      athleteId,
      laps,
    })),
    dnf_log: dnfLog,
    highlight_reel: highlightReel,
  };

  return recap;
}

/**
 * Run recap engine and persist output
 * @param {Array<Object>} ticks
 * @returns {Object} recap
 */
export function runRecapEngine(ticks) {
  const recap = recapReducer(ticks);

  const valid = validateAgainstSchema(SCHEMA_PATH, recap);
  if (!valid) {
    console.error("❌ RecapEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(recap, null, 2));
  console.log(`✅ RecapEngine wrote ${OUTPUT_PATH}`);

  return recap;
}

export default runRecapEngine;
