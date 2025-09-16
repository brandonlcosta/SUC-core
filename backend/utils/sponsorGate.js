// /suc-core/utils/sponsorGate.js
// Sponsor Gate v1 — enforce TTLs, frequency caps, cooldowns, and brand rotation.
// Single responsibility: choose which sponsor placements to render this tick.
// ESM, ≤300 LOC, no external deps.
// API:
//   import { createSponsorGate } from '../utils/sponsorGate.js'
//   const gate = createSponsorGate(configJSON)
//   const plans = gate.plan({ ts, triggers: ['rivalry','comeback'] })
//   -> [{ slot_id, brand_id, position, start_ts, end_ts }]
//
// Notes:
// - Fail-closed: if caps/cooldowns violated or no eligible brand, return [] for that slot.
// - Frequency windows: rolling 60s / 3600s / 86400s.
// - Rotation: round-robin with optional weight expansion.

export function createSponsorGate(config) {
  const cfg = normalizeConfig(config);
  const state = {
    cfg,
    // Active placements per slot: { brand_id, end_ts }
    active: new Map(),               // slot_id -> { brand_id, end_ts }
    // Per-slot counters history for caps
    history: new Map(),              // slot_id -> [{ ts }]
    // Per-slot rotation pointers
    rotationIdx: new Map(),          // slot_id -> index
    // Per-slot brand cooldowns (last served ts)
    lastServe: new Map()             // slot_id|brand_id -> ts
  };
  return {
    state,
    plan({ ts = Date.now(), triggers = [] } = {}) {
      const out = [];
      for (const slot of state.cfg.slots) {
        if (!shouldConsider(slot, triggers)) continue;

        // Respect existing active TTL
        const act = state.active.get(slot.id);
        if (act && ts < act.end_ts) {
          // Still active; don't re-serve, but count once per activation only.
          continue;
        }

        // Frequency caps
        if (!withinCaps(state, slot, ts)) continue;

        const brand = pickBrand(state, slot, ts);
        if (!brand) {
          if (slot.guardrails?.fail_closed) continue;
        } else {
          const start_ts = ts;
          const end_ts = ts + (slot.duration_s * 1000);
          state.active.set(slot.id, { brand_id: brand.id, end_ts });
          bumpHistory(state, slot.id, ts);
          state.lastServe.set(keyLB(slot.id, brand.id), ts);
          out.push({
            slot_id: slot.id,
            brand_id: brand.id,
            position: slot.position,
            start_ts,
            end_ts
          });
        }
      }
      // Clean expired actives
      sweepExpired(state, ts);
      return out;
    }
  };
}

function normalizeConfig(config) {
  const slots = (config?.slots || []).map(s => ({
    id: s.id,
    position: s.position,
    on: s.on || [],
    duration_s: s.duration_s ?? 15,
    cooldown_s: s.cooldown_s ?? 5,
    max_concurrent: s.max_concurrent ?? 1,
    frequency_caps: {
      per_minute: s.frequency_caps?.per_minute ?? 6,
      per_hour: s.frequency_caps?.per_hour ?? 60,
      per_day: s.frequency_caps?.per_day ?? 300
    },
    rotation: {
      strategy: s.rotation?.strategy || 'round_robin',
      brands: expandWeights(s.rotation?.brands || [])
    },
    guardrails: {
      categories_allow: s.guardrails?.categories_allow || ['general'],
      fail_closed: s.guardrails?.fail_closed !== false
    }
  }));
  return { slots };
}

function shouldConsider(slot, triggers) {
  if (slot.on.includes('always')) return true;
  return triggers.some(t => slot.on.includes(t));
}

function withinCaps(state, slot, ts) {
  const hist = state.history.get(slot.id) || [];
  const minuteAgo = ts - 60_000;
  const hourAgo = ts - 3_600_000;
  const dayAgo = ts - 86_400_000;
  const m = hist.filter(x => x >= minuteAgo).length;
  const h = hist.filter(x => x >= hourAgo).length;
  const d = hist.filter(x => x >= dayAgo).length;
  if (m >= slot.frequency_caps.per_minute) return false;
  if (h >= slot.frequency_caps.per_hour) return false;
  if (d >= slot.frequency_caps.per_day) return false;
  return true;
}

function bumpHistory(state, slotId, ts) {
  const arr = state.history.get(slotId) || [];
  arr.push(ts);
  // trim old (older than 1 day)
  const dayAgo = ts - 86_400_000;
  while (arr.length && arr[0] < dayAgo) arr.shift();
  state.history.set(slotId, arr);
}

function pickBrand(state, slot, ts) {
  const brands = slot.rotation.brands;
  if (!brands.length) return null;
  let idx = state.rotationIdx.get(slot.id) || 0;

  // Try up to N brands to find an eligible one
  for (let tries = 0; tries < brands.length; tries++) {
    const b = brands[(idx + tries) % brands.length];
    if (brandEligible(state, slot, b, ts)) {
      // advance pointer for next time
      state.rotationIdx.set(slot.id, (idx + tries + 1) % brands.length);
      return b;
    }
  }
  return null;
}

function brandEligible(state, slot, brand, ts) {
  // Cooldown per brand per slot
  const last = state.lastServe.get(keyLB(slot.id, brand.id)) || 0;
  if (ts - last < slot.cooldown_s * 1000) return false;
  // Do not show same brand if already active in the slot
  const act = state.active.get(slot.id);
  if (act && act.brand_id === brand.id && ts < act.end_ts) return false;
  return true;
}

function expandWeights(brands) {
  // Create a flat array respecting integer weights (cap at 10x expansion to stay small)
  const out = [];
  for (const b of brands) {
    const w = Math.max(1, Math.min(10, Math.floor(b.weight || 1)));
    for (let i = 0; i < w; i++) out.push({ id: b.id, weight: w });
  }
  return out;
}

function keyLB(slotId, brandId) { return `${slotId}|${brandId}`; }

function sweepExpired(state, ts) {
  for (const [slotId, act] of state.active.entries()) {
    if (ts >= act.end_ts) state.active.delete(slotId);
  }
}

export default { createSponsorGate };
