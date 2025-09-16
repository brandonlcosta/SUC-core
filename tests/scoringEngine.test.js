import { createScoringEngine } from '../backend/engines/scoringEngine.js';

test('scoringEngine builds leaderboard', () => {
  const se = createScoringEngine();
  const out = se.update([
    {
      event_id: 'e3',
      event_type: 'lap_split',
      athlete_id: 'ath1',
      timestamp: Date.now(),
      metadata: { laps_completed: 1 }
    }
  ]);
  expect(out.leaderboard.length).toBeGreaterThan(0);
});
