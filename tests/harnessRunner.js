// File: tests/harnessRunner.js

import fs from "fs";
import path from "path";

import { runScoringEngine } from "../backend/engines/scoringEngine.js";
import { runMetaEngine } from "../backend/engines/metaEngine.js";
import { runStoryEngine } from "../backend/engines/storyEngine.js";
import { runBroadcastEngine } from "../backend/engines/broadcastEngine.js";

// Pipeline context
const ctx = {};
const state = { scoring: {}, runners: [] };

// Load test events
const eventsPath = path.resolve("./backend/inputs/events.jsonl");
const raw = fs.readFileSync(eventsPath, "utf8").trim().split("\n");
const events = raw.map(line => JSON.parse(line));

console.log("▶ Running Harness with", events.length, "events");

// Step 1: Scoring
runScoringEngine(events, state, ctx);

// Step 2: Meta
runMetaEngine(events, state, ctx);

// Step 3: Story
runStoryEngine(events, state, ctx);

// Step 4: Broadcast
runBroadcastEngine(events, state, ctx);

// Outputs directory
const outputsDir = path.resolve("./backend/outputs/broadcast");
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

// Write outputs
fs.writeFileSync(path.join(outputsDir, "scoring.json"), JSON.stringify(ctx.scoring, null, 2));
fs.writeFileSync(path.join(outputsDir, "meta.json"), JSON.stringify(ctx.meta, null, 2));
fs.writeFileSync(path.join(outputsDir, "story.json"), JSON.stringify(ctx.story, null, 2));
fs.writeFileSync(path.join(outputsDir, "overlays.json"), JSON.stringify(ctx.broadcast, null, 2));

console.log("✅ Harness completed. Outputs written to /backend/outputs/broadcast/");
