// File: backend/engines/metaEngineV2.js

import { loadConfig } from "../services/configLoader.js";

/**
 * Analyzes events for highlights, rivalries, streaks, projections, etc.
 * Pure function — rules are pulled from metaConfig.json.
 *
 * @param {Array} events - normalized events
 * @returns {Array} prioritized highlights (sorted by weight desc)
 */
export function analyzeMeta(events = []) {
  const metaConfig = loadConfig("metaConfig.json", "configs");

  if (!metaConfig) {
    throw new Error("[MetaEngineV2] Missing metaConfig.json in /configs");
  }

  const highlights = [];

  for (const ev of events) {
    // --- Streak detection ---
    if (
      ev.type === "capture" &&
      ev.streak >= metaConfig.streak_thresholds.captures
    ) {
      highlights.push({
        type: "streak",
        weight: metaConfig.highlight_weights.streak,
        event: ev,
      });
    }

    if (
      ev.type === "win" &&
      ev.streak >= metaConfig.streak_thresholds.wins
    ) {
      highlights.push({
        type: "win_streak",
        weight: metaConfig.highlight_weights.streak,
        event: ev,
      });
    }

    // --- Rivalry detection ---
    if (ev.type === "rivalry_trigger") {
      highlights.push({
        type: "rivalry",
        weight: metaConfig.highlight_weights.rivalry,
        event: ev,
      });
    }

    // --- Personal record detection ---
    if (ev.type === "pr") {
      highlights.push({
        type: "personal_record",
        weight: metaConfig.highlight_weights.pr,
        event: ev,
      });
    }
  }

  // Prioritize by highlight weight
  return highlights.sort((a, b) => b.weight - a.weight);
}

/**
 * Batch analyzer across multiple event windows.
 * Useful for recap generation or replay reconstruction.
 *
 * @param {Array} eventWindows - array of arrays (sliding windows of events)
 * @returns {Array} flattened & prioritized highlights
 */
export function analyzeMetaBatch(eventWindows = []) {
  return eventWindows.flatMap(analyzeMeta).sort((a, b) => b.weight - a.weight);
}
