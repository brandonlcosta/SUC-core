// scripts/run_studio.mjs
import { createWorld } from "../ecs/world.js";
import { recognitionGraphSystem, makeEvent } from "../engines/recognitionGraph.system.js";
import { metaPrioritySystem } from "../engines/metaPriority.system.js";
import { storyArcSystem } from "../engines/storyArc.system.js";
import { studioFeedSystem } from "../engines/studioFeed.system.js";
import { sponsorTTLSystem } from "../engines/sponsorTTL.system.js";

const world = createWorld();
world.registerSystem(recognitionGraphSystem());
world.registerSystem(metaPrioritySystem());
world.registerSystem(storyArcSystem());
world.registerSystem(studioFeedSystem());
const sponsor = sponsorTTLSystem(); world.registerSystem(sponsor);

// seed sponsors (optional)
sponsor.registerCampaign(world, "top_rivalry_banner", { id:"brandA", ttl_ms:3600_000, frequency_cap:100, cooldown_ms:100 });
sponsor.registerCampaign(world, "top_rivalry_banner", { id:"brandB", ttl_ms:3600_000, frequency_cap:100, cooldown_ms:100 });

// TODO: replace with real feed adapter (Doc 4)
// quick demo events:
const demo = [
  { event_id:"d1", event_type:"capture", athlete_id:"A", turf_id:"K2", timestamp:Date.now() },
  { event_id:"d2", event_type:"capture", athlete_id:"B", turf_id:"K2", timestamp:Date.now()+1000 },
  { event_id:"d3", event_type:"capture", athlete_id:"A", turf_id:"K2", timestamp:Date.now()+2000 }
];
for (const ev of demo) { const id = world.addEntity(); world.addComponent(id, makeEvent(ev)); }

await world.tick(); // graph
await world.tick(); // meta + arcs + feed
console.log("studio feed -> outputs/logs/studioFeed.json");
