// tests/test_metaPriority.js
/**************************************************
 * Test: Meta Priority tiers
 **************************************************/
import { createWorld } from "../ecs/world.js";
import { recognitionGraphSystem, makeEvent } from "../engines/recognitionGraph.system.js";
import { metaPrioritySystem } from "../engines/metaPriority.system.js";

(async function run() {
  console.log("\n=== Testing: Meta Priority ===");
  const world = createWorld();
  world.registerSystem(recognitionGraphSystem());
  world.registerSystem(metaPrioritySystem());

  // Seed context (rivalry + streak)
  const setup = [
    { event_id:"s1", event_type:"capture", athlete_id:"A", turf_id:"K2", timestamp:Date.now()-60000 },
    { event_id:"s2", event_type:"capture", athlete_id:"B", turf_id:"K2", timestamp:Date.now()-59000 },
    { event_id:"s3", event_type:"capture", athlete_id:"A", turf_id:"K2", timestamp:Date.now()-58000 },
    { event_id:"s4", event_type:"capture", athlete_id:"A", turf_id:"K2", timestamp:Date.now()-57000 }
  ];

  const seq = [
    { event_id:"m1", event_type:"beam_flip", athlete_id:"A", turf_id:"K2", timestamp:Date.now() },       // high
    { event_id:"m2", event_type:"defense",   athlete_id:"B", turf_id:"K2", timestamp:Date.now()+1000 },  // med
    { event_id:"m3", event_type:"split",     athlete_id:"C", turf_id:"NA", timestamp:Date.now()+2000 }   // med (base 4)
  ];

  for (const ev of [...setup, ...seq]) {
    const id = world.addEntity();
    world.addComponent(id, makeEvent(ev));
  }

  await world.tick(); // graph populate
  await world.tick(); // meta scores

  const tiers = world.query(["Event","Highlight"])
    .slice(-3)
    .map(({components}) => components.get("Highlight").tier);

  console.log("Tiers:", tiers);
  const expected = ["high","med","med"];
  if (tiers.join(',') !== expected.join(',')) throw new Error("Tiering mismatch");

  console.log("✅ Meta Priority passed");
})();
