// File: backend/engines/commentaryEngine.js
// Commentary Engine: generates commentary lines from events + story arcs

import { normalizeEvent } from "./eventEngine.js";

/**
 * Generate commentary lines from normalized events and optional story arcs.
 * @param {Array<Object>} events
 * @param {Array<Object>} stories
 * @returns {Array<Object>} commentary lines
 */
export function runCommentaryEngine(events = [], stories = []) {
  const lines = [];

  for (const ev of events) {
    const norm = normalizeEvent(ev);

    if (norm.type === "lap_completed") {
      lines.push({
        ts: norm.ts,
        type: "commentary",
        text: `Runner ${norm.payload?.athlete_id} completed lap ${norm.payload?.lap}`,
        priority: 7,
      });
    }

    if (norm.type === "pr_achieved") {
      lines.push({
        ts: norm.ts,
        type: "commentary",
        text: `🔥 Personal record for ${norm.payload?.athlete_id}!`,
        priority: 9,
      });
    }
  }

  // Story-driven commentary
  for (const arc of stories) {
    lines.push({
      ts: arc.ts || Date.now(),
      type: "commentary",
      text: `📖 Story update: ${arc.summary}`,
      priority: 6,
    });
  }

  return lines;
}

// Wrapper class for default export
export class CommentaryEngine {
  run(events, stories) {
    return runCommentaryEngine(events, stories);
  }
}

// Default singleton instance
const commentaryEngine = new CommentaryEngine();
export default commentaryEngine;
