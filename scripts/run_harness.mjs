// scripts/run_harness.mjs
// Run ECS under the Harness Adapter (file-based JSONL). Ticks on an interval.
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createWorld } from "../../ecs/world.js";
import { recognitionGraphSystem, makeEvent } from "../engines/recognitionGraph.system.js";
import { metaPrioritySystem } from "../engines/metaPriority.system.js";
import { storyArcSystem } from "../engines/storyArc.system.js";
import { studioFeedSystem } from "../engines/studioFeed.system.js";
import { sponsorTTLSystem } from "../engines/sponsorTTL.system.js";
import { createHarnessAdapter } from "../services/harness.adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const world = createWorld();

// Systems: order matters for data flow
world.registerSystem(recognitionGraphSystem());
world.registerSystem(metaPrioritySystem());
world.registerSystem(storyArcSystem());
world.registerSystem(studioFeedSystem());
const sponsor = sponsorTTLSystem(); world.registerSystem(sponsor);

// Seed some sponsors for demo
sponsor.registerCampaign(world, "top_rivalry_banner", { id:"brandA", ttl_ms: 3600_000, frequency_cap: 100, cooldown_ms: 250 });
sponsor.registerCampaign(world, "top_rivalry_banner", { id:"brandB", ttl_ms: 3600_000, frequency_cap: 100, cooldown_ms: 250 });

// Harness adapter reading JSONL (append more lines while this runs)
const adapter = createHarnessAdapter({ source: path.join(__dirname, "..", "inputs", "events.jsonl") });

// Main loop: start adapter (reads file once), tick every 200ms until adapter finishes.
(async function run() {
  console.log("[harness] reading from", adapter.source);
  const reader = adapter.start({ world, makeEvent });

  // tick while the adapter reads
  for (;;) {
    await world.tick();
    await sleep(200);
    // Exit when adapter finished the file (reader resolves) and no pending events
    const done = await Promise.race([reader.then(()=>true), sleep(0).then(()=>false)]);
    if (done) break;
  }

  // final ticks to flush meta/story/feed
  await world.tick();
  await world.tick();

  console.log("[harness] done. Feed -> outputs/logs/studioFeed.json");
})().catch(err => {
  console.error(err);
  process.exit(1);
});
