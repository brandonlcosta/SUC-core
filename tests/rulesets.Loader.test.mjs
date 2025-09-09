// tests/rulesets.loader.test.mjs
// ESM + cross-platform (Windows-safe) import using file URL.
// Node 18+ (tested up to v22). Keeps ECS/ESM style.

import assert from 'node:assert';

// Import rulesets loader via file URL to avoid Windows "c:" scheme error.
const rulesetsIndexUrl = new URL('../rulesets/index.mjs', import.meta.url);
const { listRulesets, getRulesetByMode } = await import(rulesetsIndexUrl.href);

const all = await listRulesets();
assert.ok(Array.isArray(all) && all.length >= 3, 'should discover >=3 rulesets');

const backyard = await getRulesetByMode('backyardUltra');
assert.equal(backyard.parameters.lapDistanceMiles, 4.167);
assert.equal(backyard.scoring.units, 'laps');

const turf = await getRulesetByMode('turfWars');
assert.equal(turf.parameters.teams.length, 2);
assert.equal(turf.scoring.units, 'points');

const road = await getRulesetByMode('roadRace');
assert.equal(road.scoring.units, 'time');
assert.ok(road.parameters.distanceMiles > 0);

console.log('✓ rulesets loader OK — backyardUltra, turfWars, roadRace available');
