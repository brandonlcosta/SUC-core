import { createBroadcastEngine } from '../backend/engines/broadcastEngine.js';

test('broadcastEngine tick produces output', () => {
  const be = createBroadcastEngine({});
  const out = be.tick({
    ts: Date.now(),
    events: [{ event_id: 'e1', event_type: 'PASS', athlete_id: 'ath1' }]
  });
  expect(out).toHaveProperty('hud');
  expect(out).toHaveProperty('highlights');
  expect(out).toHaveProperty('recap');
});
