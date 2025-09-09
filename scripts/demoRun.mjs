// scripts/demoRun.mjs
// ESM demo: ingest events -> compute highlights -> show sponsor rotation -> write studioFeed.json
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createWorld } from "../ecs/world.js";
import { recognitionGraphSystem, makeEvent } from "../engines/recognitionGraph.system.js";
import { metaPrioritySystem } from "../engines/metaPriority.system.js";
import { sponsorTTLSystem } from "../engines/sponsorTTL.system.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

async function loadMock() {
  const p = path.join(repoRoot, "tests", "mocks", "mockEvents.json");
  return JSON.parse(await readFile(p, "utf8"));
}

async function main() {
  const world = createWorld();
  const graph = recognitionGraphSystem();
  const meta  = metaPrioritySystem();
  const sponsor = sponsorTTLSystem();

  world.registerSystem(graph);
  world.registerSystem(meta);
  world.registerSystem(sponsor);

  // seed sponsors
  sponsor.registerCampaign(world, "top_rivalry_banner", { id:"brandA", uri:"/assets/sponsors/brandA.png", ttl_ms: 3600_000, frequency_cap: 100, cooldown_ms: 100 });
  sponsor.registerCampaign(world, "top_rivalry_banner", { id:"brandB", uri:"/assets/sponsors/brandB.png", ttl_ms: 3600_000, frequency_cap: 100, cooldown_ms: 100 });

  // ingest events
  const events = await loadMock();
  for (const ev of events) {
    const id = world.addEntity();
    world.addComponent(id, makeEvent(ev));
  }

  // two ticks: populate graph, then score meta
  await world.tick();
  await world.tick();

  // collect last N scored items
  const scored = world.query(["Event","Highlight"]).map(({components}) => {
    const e = components.get("Event");
    const h = components.get("Highlight");
    return { id: e.event_id, type: e.event_type, athlete: e.athlete_id, turf: e.turf_id, score: h?.score, tier: h?.tier, reasons: h?.reasons };
  });

  const active = sponsor.getActiveCreative(world, "top_rivalry_banner");

  console.log("\n=== Demo Results ===");
  console.table(scored);
  console.log("Sponsor:", active?.creative?.id || null);

  // emit compact studio feed
  const feed = {
    ticker: scored.slice(-5).map(s => ({ t: s.type, a: s.athlete, turf: s.turf, tier: s.tier })),
    leaderboardHints: [
      ...scored.filter(s => s.tier === "high").map(s => ({ athlete: s.athlete, turf: s.turf, score: s.score }))
    ].slice(-5),
    sponsor: active,
    meta: { generated_at: Date.now() }
  };

  const outDir = path.join(repoRoot, "outputs", "logs");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "studioFeed.json"), JSON.stringify(feed, null, 2), "utf8");

  console.log(`\nWrote ${path.join("outputs","logs","studioFeed.json")}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
