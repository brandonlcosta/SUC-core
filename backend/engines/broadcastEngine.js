// /backend/engines/broadcastEngine.js

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/broadcast.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/broadcastSchema.json");

/**
 * Reducer: builds a unified broadcast bundle
 */
export function broadcastReducer(leaderboard, stories, commentary) {
  return {
    leaderboard: leaderboard || null,
    stories: Array.isArray(stories) ? stories : stories?.stories || [],
    commentary: Array.isArray(commentary) ? commentary : [],
    timestamp: Date.now()
  };
}

/**
 * Run broadcast engine and persist output
 */
export function runBroadcastEngine(leaderboard, stories, commentary) {
  const broadcast = broadcastReducer(leaderboard, stories, commentary);

  const valid = validateAgainstSchema(SCHEMA_PATH, broadcast);
  if (!valid) {
    console.error("❌ BroadcastEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(broadcast, null, 2));
  console.log(`✅ BroadcastEngine wrote ${OUTPUT_PATH}`);

  return broadcast;
}

export default runBroadcastEngine;
