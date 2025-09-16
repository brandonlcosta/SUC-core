// /tests/schemaValidation.test.mjs
import { test } from 'node:test';
import assert from 'node:assert';
import { validate } from '../backend/utils/schemaGate.js';

test('broadcastTick passes schema validation', () => {
  const sample = {
    ts: Date.now(),
    ticker: [{ text: "Hello", priority: 1, ts: Date.now(), arc_id: null }],
    hud: { overlays: [], lines: [{ role: "analyst", text: "Great move" }] },
    highlights: { arcs: [] },
    recap: { manifest: [] }
  };
  const result = validate('broadcastTick', sample);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test('operatorMetrics passes schema validation', () => {
  const sample = {
    operatorId: "op1",
    action: "PIN_ARC",
    timestamp: new Date().toISOString(),
    details: { arc_id: "a1" }
  };
  const result = validate('operatorMetrics', sample);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test('normalizedEvent passes schema validation', () => {
  const sample = {
    event_id: "e1",
    ts: Date.now(),
    type: "score",
    base_statement: "Athlete scores!",
    context: { athlete_id: "p1" }
  };
  const result = validate('normalizedEvent', sample);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});
