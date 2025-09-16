// /backend/engines/storyEngine.js
// Reducer: converts meta into arcs → stories.json

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/stories.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/story.schema.json");

/**
 * Reducer: build story arcs from meta data
 * @param {Object} meta
 * @returns {Object} stories
 */
export function storyReducer(meta = {}) {
  const stories = [];

  // Rivalries → story arcs
  meta.rivalries?.forEach((r) => {
    stories.push({
      type: "rivalry",
      summary: `${r.athletes[0]} vs ${r.athletes[1]}`,
      timestamp: r.timestamp,
    });
  });

  // Streaks → endurance stories
  meta.streaks?.forEach((s) => {
    stories.push({
      type: "streak",
      summary: `${s.athleteId} on a ${s.laps}-lap streak!`,
      timestamp: s.timestamp,
    });
  });

  // Projections → future story arcs
  meta.projections?.forEach((p) => {
    stories.push({
      type: "projection",
      summary: `${p.athleteId} expected next at ${new Date(p.expected_next).toLocaleTimeString()}`,
      timestamp: Date.now(),
    });
  });

  return { stories };
}

/**
 * Run story engine and persist output
 * @param {Object} meta
 * @returns {Object} stories
 */
export function runStoryEngine(meta) {
  const stories = storyReducer(meta);

  const valid = validateAgainstSchema(SCHEMA_PATH, stories);
  if (!valid) {
    console.error("❌ StoryEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stories, null, 2));
  console.log(`✅ StoryEngine wrote ${OUTPUT_PATH}`);

  return stories;
}

// Export both named + default for compatibility
export default runStoryEngine;
