import { createMetaEngine } from '../backend/engines/metaEngine.js';

test('metaEngine enriches events', () => {
  const me = createMetaEngine({});
  const enriched = me.reduce({
    type: 'INGEST_EVENTS',
    payload: { ts: Date.now(), events: [{ athlete_id: 'ath1', event_type: 'PASS' }] }
  });
  expect(Array.isArray(enriched)).toBe(true);
});
