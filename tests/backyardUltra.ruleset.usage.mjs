// tests/backyardUltra.ruleset.usage.mjs
// Minimal runnable usage snippet (Node 18+, ESM). Simulates tiny event flow and validates key ruleset bits.

import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert';

const RULESET_PATH = path.resolve('rulesets/BackyardUltra.ruleset.json');
const rs = JSON.parse(await fs.readFile(RULESET_PATH, 'utf8'));

// Basic shape checks
assert.equal(rs.mode, 'backyard_ultra');
assert.equal(rs.parameters.lapWindowMinutes, 60);
assert.ok(rs.commentary.templates.elimination.length > 0);

// Tiny mock: 3 athletes, Lap 1 all complete, Lap 2 one timeout, Lap 3 two start; one fails -> winner
const now = Date.now();
const hour = 60 * 60 * 1000;
const start = now - (now % hour); // align to top of hour

const athletes = [
  { athleteId: 'A', displayName: 'Aria' },
  { athleteId: 'B', displayName: 'Ben'  },
  { athleteId: 'C', displayName: 'Cleo' }
];

const laps = [];
function addLap(aid, lapNumber, startAt, finishAt, reason = null) {
  laps.push({
    athleteId: aid,
    lapNumber,
    startAt,
    finishAt,
    elapsedMs: finishAt ? (finishAt - startAt) : null,
    status: finishAt ? 'COMPLETED' : 'DNF',
    dnfReason: reason
  });
}

// Lap 1 — all complete within window
for (const a of athletes) addLap(a.athleteId, 1, start, start + 52 * 60 * 1000);

// Lap 2 — C times out
addLap('A', 2, start + hour, start + hour + 51 * 60 * 1000);
addLap('B', 2, start + hour, start + hour + 59 * 60 * 1000);
addLap('C', 2, start + hour, null, 'TIMEOUT');

// Lap 3 — sudden death with A vs B
addLap('A', 3, start + 2 * hour, start + 2 * hour + 50 * 60 * 1000);
addLap('B', 3, start + 2 * hour, null, 'TIMEOUT');

// Ranking helper per ruleset.scoring
function summarize(athId) {
  const mine = laps.filter(l => l.athleteId === athId);
  const completed = mine.filter(l => l.status === 'COMPLETED');
  const last = completed.sort((a,b) => b.lapNumber - a.lapNumber)[0] || null;
  return {
    athleteId: athId,
    laps: completed.length,
    lastLapElapsedMs: last ? last.elapsedMs : null,
    status: mine.some(l => l.status === 'DNF') && mine.every(l => l.lapNumber >= 2) ? 'ELIMINATED' : 'ACTIVE'
  };
}

const standings = athletes.map(a => summarize(a.athleteId))
  .sort((x, y) =>
    (y.laps - x.laps) ||
    ((x.lastLapElapsedMs ?? Infinity) - (y.lastLapElapsedMs ?? Infinity))
  );

assert.equal(standings[0].athleteId, 'A');    // Aria wins
assert.equal(standings[0].laps, 3);

console.log('✓ BackyardUltra ruleset sanity OK');
