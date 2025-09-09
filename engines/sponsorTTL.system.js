// engines/sponsorTTL.system.js
/**************************************************
 * Sponsor TTL + rotation (fail-closed)
 **************************************************/
import { c } from "../ecs/world.js";

const SPONSOR_STATE = "SponsorState"; // { slots: { [slot]: { items: [], cursor: 0 } } }

export function sponsorTTLSystem() {
  function ensure(world) {
    const s = world.query([SPONSOR_STATE])[0];
    if (s) return s.components.get(SPONSOR_STATE);
    const e = world.addEntity();
    return world.addComponent(e, c(SPONSOR_STATE, { slots: {} }));
  }

  const now = () => Date.now();

  return {
    name: 'sponsorTTLSystem',
    update(world) {
      const state = ensure(world);
      for (const slot of Object.keys(state.slots)) {
        const bucket = state.slots[slot];
        bucket.items = bucket.items.filter(it => now() < it.expires_at);
        if (bucket.cursor >= bucket.items.length) bucket.cursor = 0;
      }
    },
    registerCampaign(world, slot, creative) {
      const state = ensure(world);
      const bucket = (state.slots[slot] ||= { items: [], cursor: 0 });
      const start = creative.start_ts || now();
      const expires_at = start + (creative.ttl_ms || 0);
      bucket.items.push({ ...creative, start_ts: start, expires_at, served: 0, last_served: 0 });
    },
    getActiveCreative(world, slot) {
      const state = ensure(world);
      const bucket = state.slots[slot];
      if (!bucket || bucket.items.length === 0) return null; // fail-closed

      for (let i = 0; i < bucket.items.length; i++) {
        const idx = (bucket.cursor + i) % bucket.items.length;
        const it = bucket.items[idx];
        const t = now();
        if (t >= it.expires_at) continue;
        if (it.frequency_cap && it.served >= it.frequency_cap) continue;
        if (it.cooldown_ms && t - it.last_served < it.cooldown_ms) continue;
        bucket.cursor = (idx + 1) % bucket.items.length;
        it.served++; it.last_served = t;
        return { slot, creative: it, ms_remaining: it.expires_at - t };
      }
      return null;
    }
  };
}
