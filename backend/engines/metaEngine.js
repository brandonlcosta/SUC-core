// /backend/engines/metaEngine.js
// Rivalries, streaks, projections
import fs from 'fs';
import path from 'path';

const outputsDir = path.resolve('./outputs/logs');
const eventsPath = path.join(outputsDir, 'events.ndjson');

fs.mkdirSync(outputsDir, { recursive: true });
if (!fs.existsSync(eventsPath)) fs.writeFileSync(eventsPath, '', 'utf8');

const readEvents = () =>
  fs.readFileSync(eventsPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);

const state = {};
let seq = 200000;

const writeEvent = (evt) => {
  const enriched = {
    seq: seq++,
    timestamp: new Date().toISOString(),
    priority: 0.25,
    confidence: 0.6,
    source: 'metaEngine.projection',
    ...evt
  };
  fs.appendFileSync(eventsPath, JSON.stringify(enriched) + '\n');
};

const rebuildState = () => {
  readEvents().forEach(e => {
    if (!e.runnerId) return;
    state[e.runnerId] ??= { lastCp: 0, lastTs: Date.now(), lap: 0 };
    if (e.type === 'checkpoint' && e.trust === 'truth') {
      state[e.runnerId].lastCp = e.checkpointIndex;
      state[e.runnerId].lastTs = Date.parse(e.timestamp) || Date.now();
    }
    if (e.type === 'lap' && e.trust === 'truth') {
      state[e.runnerId].lap = e.lap;
    }
  });
};

// Example loop — replace with /configs/rulesets/backyardUltra.ruleset.json
const loopCoords = [
  [-122.414, 37.778], [-122.416, 37.777], [-122.418, 37.776],
  [-122.419, 37.774], [-122.417, 37.773], [-122.415, 37.773],
  [-122.413, 37.775], [-122.413, 37.777], [-122.414, 37.778]
];

const TIME_TO_NEXT_MS = 10000;

const project = () => {
  const now = Date.now();
  Object.keys(state).forEach(rid => {
    const s = state[rid];
    const from = s.lastCp;
    const to = (from + 1) % (loopCoords.length - 1);
    const p0 = loopCoords[from];
    const p1 = loopCoords[to];
    const t = Math.min(1, (now - s.lastTs) / TIME_TO_NEXT_MS);
    const lon = p0[0] + (p1[0] - p0[0]) * t;
    const lat = p0[1] + (p1[1] - p0[1]) * t;
    writeEvent({
      type: 'projected_position',
      trust: 'projection',
      runnerId: rid,
      fromCheckpoint: from,
      toCheckpoint: to,
      t,
      position: { lon, lat }
    });
  });
};

rebuildState();
setInterval(() => {
  rebuildState();
  project();
}, 2000);

console.log('metaEngine: projection loop active');
