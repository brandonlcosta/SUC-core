// /tests/metaEngine.test.js
// Pure Node harness (<=150 LOC). No frameworks.
// Verifies rivalry + streak detection and priority tiers.
import { createMetaEngine } from '../engines/metaEngine.js';

const log = (...a) => process.stdout.write(a.map(x => typeof x === 'string' ? x : JSON.stringify(x, null, 2)).join(' ') + '\n');

function assert(cond, msg) {
  if (!cond) { console.error('❌', msg); process.exit(1); }
}

function simulate() {
  const engine = createMetaEngine();
  const A = 'a1', B = 'b2';

  // Tick 1: baseline splits, leader is B, small gap -> rivalry warms up
  let out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 1, events: [
    { id:'e1', ts:1, athlete_id: A, event_type:'SPLIT', position:2, metrics:{ split_s: 300, gap_s_to_leader: 2.2, leader_athlete_id: B } },
    { id:'e2', ts:1, athlete_id: B, event_type:'SPLIT', position:1, metrics:{ split_s: 298, gap_s_to_leader: 0, leader_athlete_id: B } },
  ]}});
  log('tick1', out);

  // Tick 2: A faster split (2%+), rivalry grows
  out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 2, events: [
    { id:'e3', ts:2, athlete_id: A, event_type:'SPLIT', position:2, metrics:{ split_s: 293, gap_s_to_leader: 1.6, leader_athlete_id: B } }, // positive
    { id:'e4', ts:2, athlete_id: B, event_type:'SPLIT', position:1, metrics:{ split_s: 300, gap_s_to_leader: 0, leader_athlete_id: B } },
  ]}});
  log('tick2', out);

  // Tick 3: A takes lead (lead change) -> rivalry spike, streak=2 -> emit high priority
  out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 3, events: [
    { id:'e5', ts:3, athlete_id: A, event_type:'LEAD_CHANGE', position:1, metrics:{ split_s: 292, gap_s_to_leader: 0, leader_athlete_id: A } },
    { id:'e6', ts:3, athlete_id: B, event_type:'SPLIT', position:2, metrics:{ split_s: 305, gap_s_to_leader: 1.2, leader_athlete_id: A } },
  ]}});
  log('tick3', out);
  assert(out.some(e => e.narrative_type.includes('rivalry')), 'Should detect rivalry on lead change');
  assert(out.some(e => e.highlight_priority >= 6), 'Lead change rivalry should be priority >=6');
  assert(out.some(e => e.narrative_type.includes('streak')), 'Streak should be active for A');

  // Tick 4: A logs a PR -> ensure PR boosts priority
  out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 4, events: [
    { id:'e7', ts:4, athlete_id: A, event_type:'PERSONAL_RECORD', position:1, metrics:{ split_s: 288, gap_s_to_leader: 0, leader_athlete_id: A } },
  ]}});
  log('tick4', out);
  const prEvent = out.find(e => e.context.is_pr);
  assert(prEvent && prEvent.highlight_priority >= 7, 'PR should elevate priority (>=7)');

  // Tick 5: B starts a comeback (gap shrinking over window)
  out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 5, events: [
    { id:'e8', ts:5, athlete_id: B, event_type:'SPLIT', position:2, metrics:{ split_s: 295, gap_s_to_leader: 1.5, leader_athlete_id: A } },
  ]}});
  out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 6, events: [
    { id:'e9', ts:6, athlete_id: B, event_type:'SPLIT', position:2, metrics:{ split_s: 294, gap_s_to_leader: 1.1, leader_athlete_id: A } },
  ]}});
  out = engine.reduce({ type: 'INGEST_EVENTS', payload: { ts: 7, events: [
    { id:'e10', ts:7, athlete_id: B, event_type:'SPLIT', position:2, metrics:{ split_s: 292, gap_s_to_leader: 0.7, leader_athlete_id: A } },
  ]}});
  log('tick7', out);
  assert(out.some(e => e.narrative_type.includes('comeback')), 'Comeback should be detected for B');
  assert(out.some(e => e.highlight_priority >= 5), 'Comeback should be watchable (>=5)');

  console.log('✅ metaEngine v2 harness passed');
}

simulate();
