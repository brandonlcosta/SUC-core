#!/usr/bin/env node
/**
 * Demo Run Script
 * Wires MetaEngine → StoryEngine → CommentaryEngine → BroadcastEngine.
 * Emits HUD, ticker, recap to backend/outputs/.
 */

import { createBroadcastEngine } from '../backend/engines/broadcastEngine.js';
import { createMetaEngine } from '../backend/engines/metaEngine.js';
import { createStoryEngine } from '../backend/engines/storyEngine.js';
import { createCommentaryEngine } from '../backend/engines/commentaryEngine.js';
import { appendFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

// ---- setup ----
const OUTPUT_DIR = 'backend/outputs/broadcast';
mkdirSync(OUTPUT_DIR, { recursive: true });

const be = createBroadcastEngine({});
const me = createMetaEngine({});
const se = createStoryEngine({});
const ce = createCommentaryEngine({});

console.log('⚡ Demo Run Started');

// ---- mock events ----
const sampleEvents = [
  { event_id: 'e1', event_type: 'PASS', athlete_id: 'ath1', timestamp: Date.now() },
  { event_id: 'e2', event_type: 'LEAD_CHANGE', athlete_id: 'ath2', timestamp: Date.now(), metrics: { leader_athlete_id: 'ath1', gap_s_to_leader: 1.5 } },
  { event_id: 'e3', event_type: 'PERSONAL_RECORD', athlete_id: 'ath1', timestamp: Date.now() }
];

// ---- pipeline ----
const enriched = me.reduce({ type: 'INGEST_EVENTS', payload: { ts: Date.now(), events: sampleEvents } });
const arcs = se.reduce({ type: 'INGEST_ENRICHED', payload: { ts: Date.now(), events: enriched } });
const comms = ce.reduce({ type: 'TICK', payload: { ts: Date.now(), arcs } });
const broadcastOut = be.tick({ ts: Date.now(), events: sampleEvents });

// ---- outputs ----
function writeJSON(file, data) {
  const filePath = join(OUTPUT_DIR, file);
  mkdirSync(dirname(filePath), { recursive: true });
  appendFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

writeJSON('hud.json', broadcastOut.hud);
writeJSON('ticker.json', broadcastOut.ticker);
writeJSON('recap.json', broadcastOut.recap);

console.log('✅ Demo complete. Outputs written to backend/outputs/broadcast/');
console.log('HUD:', broadcastOut.hud);
console.log('Ticker:', broadcastOut.ticker);
console.log('Recap:', broadcastOut.recap);
