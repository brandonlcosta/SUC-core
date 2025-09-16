// /backend/engines/dailyEngine.js
// Reducer: generates daily recap (SportsCenter-style)

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/daily.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/daily.schema.json");

/**
 * Build daily recap from events + meta data
 * @param {Array<Object>} events - normalized events
 * @param {Object} meta - meta analysis (streaks, rivalries, projections)
 * @returns {Object} daily recap JSON
 */
export function dailyReducer(events = [], meta = {}) {
  const anchorStat = events.length > 0 ? events[0] : { note: "No events" };
  const weeklyTrend = meta.streaks?.[0] || { note: "No weekly trend" };
  const projection = meta.projections?.[0] || { note: "No projection" };
  const cultureClip = meta.highlights?.[0] || { note: "No culture clip" };

  return {
    anchor_stat: anchorStat,
    weekly_trend: weeklyTrend,
    projection,
    culture_clip: cultureClip,
    generated_at: Date.now()
  };
}

/**
 * Run daily engine and persist output
 * @param {Array<Object>} events
 * @param {Object} meta
 * @returns {Object} daily recap JSON
 */
export function runDailyEngine(events, meta) {
  const daily = dailyReducer(events, meta);

  const valid = validateAgainstSchema(SCHEMA_PATH, daily);
  if (!valid) {
    console.error("❌ DailyEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(daily, null, 2));
  console.log(`✅ DailyEngine wrote ${OUTPUT_PATH}`);

  return daily;
}

// Export both named + default
export default runDailyEngine;
