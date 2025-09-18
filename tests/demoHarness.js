// File: tests/demoHarness.js

import { runEventEngine } from "../backend/engines/eventEngine.js";
import { runScoringEngine } from "../backend/engines/scoringEngine.js";
import { runMetaEngine } from "../backend/engines/metaEngine.js";
import { runStoryEngine } from "../backend/engines/storyEngine.js";
import { runBroadcastEngine } from "../backend/engines/broadcastEngine.js";
import { runRecapEngine } from "../backend/engines/recapEngine.js";
import { runDailyEngine } from "../backend/engines/dailyEngine.js";
import { runSpatialEngine } from "../backend/engines/spatialEngine.js";

import fs from "fs";

async function main() {
  let state = {};
  let ctx = {};

  // 1. Load static events (harness mode)
  const events = JSON.parse(
    fs.readFileSync("./tests/events.fixture.json", "utf8")
  );

  // 2. Run pipeline step by step
  runEventEngine(events, state, ctx);
  runScoringEngine(events, state, ctx);
  runMetaEngine(events, state, ctx);
  runStoryEngine(events, state, ctx);
  runSpatialEngine(events, state, ctx);
  runBroadcastEngine(events, state, ctx);
  runRecapEngine(events, state, ctx);
  runDailyEngine(events, state, ctx);

  // 3. Dump outputs
  fs.writeFileSync(
    "./backend/outputs/broadcast/overlays.json",
    JSON.stringify(ctx.broadcast, null, 2)
  );
  fs.writeFileSync(
    "./backend/outputs/broadcast/recap.json",
    JSON.stringify(ctx.recap, null, 2)
  );
  fs.writeFileSync(
    "./backend/outputs/broadcast/daily.json",
    JSON.stringify(ctx.daily, null, 2)
  );

  console.log("Harness run complete ✅");
  console.log("Broadcast Ticks:", ctx.broadcast?.length);
  console.log("Recap Highlights:", ctx.recap?.highlight_reel?.length);
  console.log("Daily Anchors:", ctx.daily?.anchors);
}

main();
