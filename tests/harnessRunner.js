// File: tests/harnessRunner.js

import fs from "fs";
import path from "path";

// Engines
import { runScoringEngine } from "../backend/engines/scoringEngine.js";
import { runMetaEngine } from "../backend/engines/metaEngine.js";
import { runStoryEngine } from "../backend/engines/storyEngine.js";
import { runBroadcastEngine } from "../backend/engines/broadcastEngine.js";
import { runRecapEngine } from "../backend/engines/recapEngine.js";
import { runDailyEngine } from "../backend/engines/dailyEngine.js";
import { runSpatialEngine } from "../backend/engines/spatialEngine.js";

// Context + state
const ctx = {};
const state = { scoring: {}, runners: [] };

// Load test events
const eventsPath = path.resolve("./backend/inputs/events.jsonl");
if (!fs.existsSync(eventsPath)) {
  console.error("❌ No test events found at:", eventsPath);
  process.exit(1);
}
const events = fs
  .readFileSync(eventsPath, "utf8")
  .trim()
  .split("\n")
  .map(line => JSON.parse(line));

console.log("▶ Running Harness with", events.length, "events");

// Run pipeline
const scoring = runScoringEngine(events, state, ctx);
console.log("✔ scoring");

const meta = runMetaEngine(events, state, ctx);
console.log("✔ meta");

const story = runStoryEngine(events, state, ctx);
console.log("✔ story");

const broadcast = runBroadcastEngine(events, state, ctx);
console.log("✔ broadcast");

const recap = runRecapEngine(events, state, ctx);
console.log("✔ recap");

const daily = runDailyEngine(events, state, ctx);
console.log("✔ daily");

const spatial = runSpatialEngine(events, state, ctx);
console.log("✔ spatial");

// Prepare output directory
const outputsDir = path.resolve("./backend/outputs/broadcast");
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

// Write outputs
fs.writeFileSync(path.join(outputsDir, "scoring.json"), JSON.stringify(scoring, null, 2));
fs.writeFileSync(path.join(outputsDir, "meta.json"), JSON.stringify(meta, null, 2));
fs.writeFileSync(path.join(outputsDir, "story.json"), JSON.stringify(story, null, 2));
fs.writeFileSync(path.join(outputsDir, "overlays.json"), JSON.stringify(broadcast, null, 2));
fs.writeFileSync(path.join(outputsDir, "recap.json"), JSON.stringify(recap, null, 2));
fs.writeFileSync(path.join(outputsDir, "daily.json"), JSON.stringify(daily, null, 2));
fs.writeFileSync(path.join(outputsDir, "spatial.json"), JSON.stringify(spatial, null, 2));

console.log("✅ Harness completed. Outputs written to /backend/outputs/broadcast/");
