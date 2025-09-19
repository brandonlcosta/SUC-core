// File: backend/engines/broadcastEngine.js

import { loadConfig } from "../services/configLoader.js";

/**
 * Packages overlays into a broadcast-ready sequence.
 * Pure orchestrator — sequencing & layout logic live in broadcastConfig.json.
 *
 * @param {Array} overlays - list of overlays to package
 * @returns {Array} ordered overlays
 */
export function packageBroadcast(overlays = []) {
  const broadcastConfig = loadConfig("broadcastConfig.json", "configs");

  if (!broadcastConfig) {
    throw new Error("[BroadcastEngine] Missing broadcastConfig.json in /configs");
  }

  const { ticker_priority, reel_length, panels } = broadcastConfig;

  // Sort overlays by ticker priority
  const sorted = overlays.sort((a, b) => {
    const aIndex = ticker_priority.indexOf(a.type);
    const bIndex = ticker_priority.indexOf(b.type);

    return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
  });

  // Trim to configured reel length
  return sorted.slice(0, reel_length).map((overlay) => ({
    ...overlay,
    panel: panels.includes(overlay.panel) ? overlay.panel : panels[0], // fallback to first panel
  }));
}

/**
 * Groups overlays by panel type (leaderboard, story, rivalry, etc.).
 * Useful for reducer + frontend to display grouped panels.
 *
 * @param {Array} overlays
 * @returns {Object} panel → overlays[]
 */
export function groupByPanel(overlays = []) {
  return overlays.reduce((acc, overlay) => {
    if (!acc[overlay.panel]) acc[overlay.panel] = [];
    acc[overlay.panel].push(overlay);
    return acc;
  }, {});
}
