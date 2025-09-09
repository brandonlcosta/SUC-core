// /suc-core/tests/storyEngine.test.js
// Minimal Node harness (<=150 LOC). No deps.
// Builds enriched events via metaEngine, feeds Story Engine, asserts rivalry & comeback arcs.
import { createMetaEngine } from '../engines/metaEngine.js';
import { createStoryEngine } from '../engines/storyEngine.js';

const log = (label, data) => process.stdout.write(
  `${label}: ${JSON.stringify(data, null, 2)}\n`
);
function assert(c, m){ if(!c){ console.error('❌', m); process.exit(1);} }

function simulate() {
  const meta = createMetaEngine();              // defaults from your shipped Meta v2
  const story = createStoryEngine({
    thresholds: { start_priority_min: 5, inactivity_timeout_ms: 10_000, max_beats: 6 }
  });

  const A='a1', B='b2';

  // helper to push raw events through meta → story
  const tick = (t, raw) => {
    const enriched = meta.reduce({ type:'INGEST_EVENTS', payload:{ ts:t, events: raw } });
    const arcs = story.reduce({ type:'INGEST_ENRICHED', payload:{ ts: t*1000, events: enriched }});
    return { enriched, arcs };
  };

  // Rivalry heats up: small gap, lead change
  tick(1, [
    { id:'e1', ts:1, athlete_id:A, event_type:'SPLIT', position:2, metrics:{ split_s:300, gap_s_to_leader:2.2, leader_athlete_id:B } },
    { id:'e2', ts:1, athlete_id:B, event_type:'SPLIT', position:1, metrics:{ split_s:298, gap_s_to_leader:0, leader_athlete_id:B } }
  ]);
  tick(2, [
    { id:'e3', ts:2, athlete_id:A, event_type:'SPLIT', position:2, metrics:{ split_s:293, gap_s_to_leader:1.6, leader_athlete_id:B } },
    { id:'e4', ts:2, athlete_id:B, event_type:'SPLIT', position:1, metrics:{ split_s:300, gap_s_to_leader:0, leader_athlete_id:B } }
  ]);
  const t3 = tick(3, [
    { id:'e5', ts:3, athlete_id:A, event_type:'LEAD_CHANGE', position:1, metrics:{ split_s:292, gap_s_to_leader:0, leader_athlete_id:A } },
    { id:'e6', ts:3, athlete_id:B, event_type:'SPLIT', position:2, metrics:{ split_s:305, gap_s_to_leader:1.2, leader_athlete_id:A } }
  ]);
  log('arcs@t3', t3.arcs);
  assert(t3.arcs.some(a => a.arc_type==='rivalry' && a.beats.length>=1), 'Rivalry arc should start with beats');
  assert(t3.arcs.some(a => a.priority>=5), 'Rivalry arc priority should be watchable (>=5)');

  // Comeback by B over a few ticks
  tick(4, [{ id:'e7', ts:4, athlete_id:B, event_type:'SPLIT', position:2, metrics:{ split_s:297, gap_s_to_leader:1.5, leader_athlete_id:A } }]);
  tick(5, [{ id:'e8', ts:5, athlete_id:B, event_type:'SPLIT', position:2, metrics:{ split_s:295, gap_s_to_leader:1.1, leader_athlete_id:A } }]);
  const t6 = tick(6, [{ id:'e9', ts:6, athlete_id:B, event_type:'SPLIT', position:2, metrics:{ split_s:292, gap_s_to_leader:0.7, leader_athlete_id:A } }]);
  log('arcs@t6', t6.arcs);

  assert(t6.arcs.some(a => a.arc_type==='comeback' && a.a_id===B), 'Comeback arc for B should exist');
  const cb = t6.arcs.find(a => a.arc_type==='comeback' && a.a_id===B);
  assert(cb.beats.length>=1, 'Comeback arc should accumulate beats');
  assert(cb.priority>=5, 'Comeback arc priority should be watchable (>=5)');

  // Inactivity close check
  // advance time without contributing beats, ensuring closure
  story.reduce({ type:'INGEST_ENRICHED', payload:{ ts: 30_000, events: [] } });
  const afterIdle = story.reduce({ type:'INGEST_ENRICHED', payload:{ ts: 40_500, events: [] } });
  log('arcs@idle', afterIdle);
  assert(afterIdle.every(a => a.status==='closed') || afterIdle.length===0, 'Arcs should close after inactivity');

  console.log('✅ storyEngine v1 harness passed');
}

simulate();
