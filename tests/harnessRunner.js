// File: tests/harnessRunner.js

import fs from "fs";
import path from "path";

import { runScoringEngine } from "../backend/engines/scoringEngine.js";
import { runMetaEngine } from "../backend/engines/metaEngine.js";
import { runStoryEngine } from "../backend/engines/storyEngine.js";
import { runBroadcastEngine } from "../backend/engines/broadcastEngine.js";
import { runRecapEngine } from "../backend/engines/recapEngine.js";
import { runDailyEngine } from "../backend/engines/dailyEngine.js";
// soon: runSpatialEngine, runOverlayEngine, etc.

// ----------------------------
// Pipeline Setup
// ----------------------------
const ctx = {};
const state = { scoring: {}, runners: [] };

// Load test events
const eventsPath = path.resolve("./backend/inputs/events.jsonl");
if (!fs.existsSync(eventsPath)) {
  console.error("❌ No test events found at:", eventsPath);
  process.exit(1);
}
const raw = fs.readFileSync(eventsPath, "utf8").trim().split("\n");
const events = raw.map(line => JSON.parse(line));

console.log("▶ Running Harness with", events.length, "events");

// ----------------------------
// Engine Pipeline
// ----------------------------

// Step 1: Scoring
runScoringEngine(events, state, ctx);

// Step 2: Meta
runMetaEngine(events, state, ctx);

// Step 3: Story
runStoryEngine(events, state, ctx);

// Step 4: Broadcast (overlays)
runBroadcastEngine(events, state, ctx);

// Step 5: Recap
runRecapEngine(events, state, ctx);

// Step 6: Daily
runDailyEngine(events, state, ctx);

// TODO: Step 7: Spatial Engine
// TODO: Step 8: Overlay Engine

// ----------------------------
// Write Outputs
// ----------------------------
const outputsDir = path.resolve("./backend/outputs/broadcast");
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

fs.writeFileSync(path.join(outputsDir, "scoring.json"), JSON.stringify(ctx.scoring, null, 2));
fs.writeFileSync(path.join(outputsDir, "meta.json"), JSON.stringify(ctx.meta, null, 2));
fs.writeFileSync(path.join(outputsDir, "story.json"), JSON.stringify(ctx.story, null, 2));
fs.writeFileSync(path.join(outputsDir, "overlays.json"), JSON.stringify(ctx.broadcast, null, 2));
fs.writeFileSync(path.join(outputsDir, "recap.json"), JSON.stringify(ctx.recap, null, 2));
fs.writeFileSync(path.join(outputsDir, "daily.json"), JSON.stringify(ctx.daily, null, 2));

console.log("✅ Harness completed. Outputs written to /backend/outputs/broadcast/");
