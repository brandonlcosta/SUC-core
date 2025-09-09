// /suc-core/tests/broadcastEngine.test.js
// Harness: proves end-to-end integration + ordering + overlays + role balance.
// Pure Node, ≤150 LOC.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBroadcastEngine } from '../engines/broadcastEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sponsorCfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../configs/overlays/sponsorSlots.json'), 'utf8'));

function assert(c, m){ if(!c){ console.error('❌', m); process.exit(1);} }
const log = (l, d) => process.stdout.write(`${l}: ${JSON.stringify(d, null, 2)}\n`);

(function run() {
  const metricsPath = path.resolve(__dirname, '../outputs/logs/metrics.jsonl'); // may not exist; engine will create
  const be = createBroadcastEngine({
    sponsorConfig: sponsorCfg,
    commentaryConfig: { logging: { filePath: null } },
    metricsPath
  });

  const A='a1', B='b2';
  const T0 = 1_000;

  // Tick 1
  let out = be.tick({
    ts: T0,
    triggers: [],
    events: [
      { id:'e1', ts:T0, athlete_id:A, event_type:'SPLIT', position:2, metrics:{ split_s:300, gap_s_to_leader:2.2, leader_athlete_id:B } },
      { id:'e2', ts:T0, athlete_id:B, event_type:'SPLIT', position:1, metrics:{ split_s:298, gap_s_to_leader:0, leader_athlete_id:B } },
    ]
  });
  log('tick1.ticker', out.ticker);
  assert(out.ticker.length >= 1, 'Ticker should have items');
  assert(Array.isArray(out.hud.overlays), 'HUD overlays should be array');
  assert(Array.isArray(out.hud.lines) && out.hud.lines.length >= 1, 'Commentary lines should exist');

  // Tick 2 (heat up rivalry)
  out = be.tick({
    ts: T0 + 1000,
    events: [
      { id:'e3', ts:T0+1000, athlete_id:A, event_type:'SPLIT', position:2, metrics:{ split_s:293, gap_s_to_leader:1.6, leader_athlete_id:B } },
      { id:'e4', ts:T0+1000, athlete_id:B, event_type:'SPLIT', position:1, metrics:{ split_s:300, gap_s_to_leader:0, leader_athlete_id:B } }
    ]
  });
  log('tick2.topArc', out.highlights.arcs[0]);
  // Ticker ordering by priority
  const prios = out.ticker.map(x => x.priority);
  const sorted = [...prios].sort((a,b)=>b-a);
  assert(JSON.stringify(prios) === JSON.stringify(sorted), 'Ticker not sorted by priority desc');

  // At least one overlay (ticker or hud) should be planned across ticks
  // (Cooldowns might skip on a given tick; check cumulative)
  const moreOut = be.tick({
    ts: T0 + 15_000,
    events: [{ id:'e5', ts:T0+15_000, athlete_id:A, event_type:'LEAD_CHANGE', position:1, metrics:{ split_s:292, gap_s_to_leader:0, leader_athlete_id:A } }]
  });
  const overlaysTotal = [...out.hud.overlays, ...moreOut.hud.overlays];
  assert(overlaysTotal.length >= 1, 'No sponsor overlays planned across ticks');

  // Role balance: ensure we saw at least one of each role across the 2nd tick
  const roles = new Set(out.hud.lines.map(l => l.role));
  for (const r of ['play_by_play','analyst','color','wildcard']) {
    assert(roles.has(r), `Missing commentary role: ${r}`);
  }

  // Metrics file appended
  assert(fs.existsSync(metricsPath), 'metrics.jsonl not created');
  const metricsLog = fs.readFileSync(metricsPath, 'utf8').trim().split('\n').map(l=>JSON.parse(l));
  assert(metricsLog.length >= 2, 'Metrics not appended per tick');

  console.log('✅ broadcastEngine harness passed');
})();
