// File: backend/engines/storyEngineV1.js

import { loadConfig } from "../services/configLoader.js";

/**
 * Builds narrative arcs (rivalry, comeback, dominance, underdog).
 * Pure function — arc definitions live in storyConfig.json.
 *
 * @param {Array} events - normalized events
 * @returns {Array} story arcs
 */
export function buildStoryArcs(events = []) {
  const storyConfig = loadConfig("storyConfig.json", "configs");

  if (!storyConfig || !storyConfig.arc_types) {
    throw new Error("[StoryEngineV1] Missing arc_types in storyConfig.json");
  }

  const arcs = [];

  for (const ev of events) {
    // --- Rivalry Arc ---
    if (
      ev.type === "rivalry_trigger" &&
      storyConfig.arc_types.includes("rivalry")
    ) {
      arcs.push({ arc: "rivalry", event: ev });
    }

    // --- Comeback Arc ---
    if (
      ev.type === "lead_change" &&
      storyConfig.arc_types.includes("comeback")
    ) {
      arcs.push({ arc: "comeback", event: ev });
    }

    // --- Dominance Arc ---
    if (
      ev.type === "domination" &&
      storyConfig.arc_types.includes("dominance")
    ) {
      arcs.push({ arc: "dominance", event: ev });
    }

    // --- Underdog Arc ---
    if (
      ev.type === "upset_win" &&
      storyConfig.arc_types.includes("underdog")
    ) {
      arcs.push({ arc: "underdog", event: ev });
    }
  }

  return arcs;
}

/**
 * Stitches arcs into a simple timeline.
 * Useful for narrative continuity across a session.
 *
 * @param {Array} events - normalized events
 * @returns {Array} timeline of arcs
 */
export function buildStoryTimeline(events = []) {
  const arcs = buildStoryArcs(events);
  return arcs.map((arc, idx) => ({
    ...arc,
    timeline_index: idx,
  }));
}
