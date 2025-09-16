// /tests/storyEngine.test.mjs
import { test } from 'node:test';
import assert from 'node:assert';
import { createStoryEngine } from '../backend/engines/storyEngine.js';

test('StoryEngine indexes arcs by id and athlete', () => {
  const se = createStoryEngine();
  const ev = {
    event_id: 'e1',
    ts: Date.now(),
    type: 'score',
    base_statement: 'Athlete scored!',
    context: { athlete_id: 'ath1' },
    highlight_priority: 5
  };

  se.reduce({ type: 'INGEST_ENRICHED', payload: { ts: ev.ts, events: [ev] } });

  const arcs = se.getArcsByAthlete('ath1');
  assert.equal(arcs.length, 1, 'should return arc for athlete');
  const arc = se.getArcById(arcs[0].arc_id);
  assert.ok(arc, 'arc retrievable by id');
  assert.equal(arc.priority, 5);
});
