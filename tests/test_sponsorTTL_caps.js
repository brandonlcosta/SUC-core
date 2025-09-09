// tests/test_sponsorTTL_caps.js
/**************************************************
 * Test: Sponsor TTL frequency cap behavior
 **************************************************/
import { createWorld } from "../ecs/world.js";
import { sponsorTTLSystem } from "../engines/sponsorTTL.system.js";

(async function run() {
  console.log("\n=== Testing: Sponsor TTL Frequency Caps ===");
  const world = createWorld();
  const sponsor = sponsorTTLSystem();
  world.registerSystem(sponsor);

  const slot = "midroll";
  sponsor.registerCampaign(world, slot, { id:"cap1", ttl_ms: 60_000, frequency_cap: 3 }); // cap at 3
  await world.tick();

  let shown = 0;
  for (let i=0; i<10; i++) {
    const r = sponsor.getActiveCreative(world, slot);
    if (r) shown++;
  }

  console.log("Times served (expected 3):", shown);
  if (shown !== 3) throw new Error("Frequency cap not enforced");

  console.log("✅ Sponsor TTL frequency cap passed");
})();
