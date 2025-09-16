import { SignalEngine } from '../backend/engines/signalEngine.js';

test('signalEngine processes highlight event', () => {
  const se = new SignalEngine({});
  const sig = se.processEvent({
    event_id: 'e5',
    event_type: 'finish',
    athlete_id: 'ath1',
    timestamp: Date.now()
  });
  expect(sig).toHaveProperty('vibe_score');
});
