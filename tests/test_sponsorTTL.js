// tests/test_sponsorTTL.js
/**************************************************
 * Test: Sponsor TTL + rotation (fail-closed)
 **************************************************/
import { createWorld } from "../ecs/world.js";
import { sponsorTTLSystem } from "../engines/sponsorTTL.system.js";

(async function run() {
  console.log("\n=== Testing: Sponsor TTL ===");
  const world = createWorld();
  const sponsor = sponsorTTLSystem();
  world.registerSystem(sponsor);

  const slot = 'top_rivalry_banner';
  const ttl = 24 * 60 * 60 * 1000; // 1 day
  sponsor.registerCampaign(world, slot, { id:'brandA', uri:'/assets/sponsors/brandA.png', ttl_ms: ttl, frequency_cap:100, cooldown_ms:10 });
  sponsor.registerCampaign(world, slot, { id:'brandB', uri:'/assets/sponsors/brandB.png', ttl_ms: ttl, frequency_cap:100, cooldown_ms:10 });

  await world.tick();

  const c1 = sponsor.getActiveCreative(world, slot);
  const c2 = sponsor.getActiveCreative(world, slot);

  console.log('Creative 1:', c1?.creative?.id, 'Creative 2:', c2?.creative?.id);

  if (!c1 || !c2) throw new Error('Expected active creatives');
  if (c1.creative.id === c2.creative.id) throw new Error('Rotation failed');

  // Short TTL slot should fail-closed after expiry
  sponsor.registerCampaign(world, 'short_slot', { id:'brandX', uri:'/x.png', ttl_ms: 1 });
  await world.tick();
  await new Promise(r => setTimeout(r, 2));
  const expired = sponsor.getActiveCreative(world, 'short_slot');
  if (expired !== null) throw new Error('Fail-closed expected on expired slot');

  console.log("✅ Sponsor TTL passed");
})();
