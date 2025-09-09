// /suc-core/tests/sponsorGate.test.js
// Harness: simulate rapid triggers; verify caps & rotation per slot.
// Pure Node, no deps.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSponsorGate } from '../utils/sponsorGate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cfgPath = path.resolve(__dirname, '../configs/overlays/sponsorSlots.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

function assert(c, m){ if(!c){ console.error('❌', m); process.exit(1);} }
const log = (l, d) => process.stdout.write(`${l}: ${JSON.stringify(d, null, 2)}\n`);

(function run() {
  const gate = createSponsorGate(cfg);

  // Simulate 10 ticks over ~40s with rivalry triggers hammering both ticker_bug & hud_logo
  const baseTs = 1_000_000;
  const allPlacements = [];
  for (let i = 0; i < 10; i++) {
    const ts = baseTs + i * 4_000; // every 4s
    const plans = gate.plan({ ts, triggers: ['rivalry'] });
    if (plans.length) allPlacements.push(...plans);
  }
  log('placements', allPlacements.slice(0, 4)); // sample

  // Group by slot for slot-specific checks
  const bySlot = groupBy(allPlacements, p => p.slot_id);

  // --- Rotation should progress for ticker_bug ---
  const tb = bySlot['ticker_bug'] || [];
  const tbBrands = new Set(tb.map(p => p.brand_id));
  assert(tbBrands.size >= 2, 'Rotation did not progress across multiple brands for ticker_bug');

  // --- Cooldown must be enforced per slot ---
  // Read cooldowns from config
  const cooldownBySlot = Object.fromEntries(cfg.slots.map(s => [s.id, (s.cooldown_s || 0) * 1000]));
  for (const [slot, arr] of Object.entries(bySlot)) {
    const sorted = [...arr].sort((a,b)=>a.start_ts - b.start_ts);
    for (let i = 1; i < sorted.length; i++) {
      const dt = sorted[i].start_ts - sorted[i-1].start_ts;
      assert(dt >= cooldownBySlot[slot], `Cooldown not enforced for ${slot}: dt=${dt}ms`);
    }
  }

  // --- Frequency cap per minute should hold per slot ---
  for (const [slot, arr] of Object.entries(bySlot)) {
    const perMinuteMax = cfg.slots.find(s => s.id === slot)?.frequency_caps?.per_minute ?? 9999;
    const countFirst60 = countInWindow(arr.map(p => p.start_ts), 60_000);
    assert(countFirst60 <= perMinuteMax, `Per-minute cap violated for ${slot}`);
  }

  // --- Recap bumper should fire only on recap_start ---
  const noRecap = gate.plan({ ts: baseTs + 90_000, triggers: ['rivalry'] });
  assert(noRecap.every(p => p.slot_id !== 'recap_bumper'), 'Recap bumper triggered on wrong signal');

  console.log('✅ sponsorGate harness passed');
})();

function countInWindow(timestamps, windowMs) {
  if (!timestamps.length) return 0;
  const start = timestamps[0];
  return timestamps.filter(ts => ts - start < windowMs).length;
}
function groupBy(arr, keyFn) {
  const out = {};
  for (const x of arr) {
    const k = keyFn(x);
    (out[k] ||= []).push(x);
  }
  return out;
}
