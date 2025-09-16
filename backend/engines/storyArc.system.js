/**
 * Scoring Engine v0.2
 * Purpose: Maintain leaderboard and runner_state from normalized events.
 * Inputs:  update(events:Array<NormalizedEvent>)
 * Outputs: {
 *   leaderboard: [{ athlete_id, laps, rank, streak }],
 *   runner_state: { [athlete_id]: { laps, eliminated, finished, last_split_ts, streak } },
 *   started_at, finished_at, metrics
 * }
 */

import { appendMetric } from './_metrics.js';

export function createScoringEngine() {
  const state = new Map(); // athlete_id -> { laps, eliminated, finished, last_split_ts, streak }

  function ensure(athlete_id) {
    if (!state.has(athlete_id)) {
      state.set(athlete_id, {
        laps: 0,
        eliminated: false,
        finished: false,
        last_split_ts: 0,
        streak: 0
      });
    }
    return state.get(athlete_id);
  }

  function applyEvent(ev) {
    const s = ensure(ev.athlete_id);
    if (ev.event_type === 'lap_split') {
      const lc = Number.isFinite(ev.metadata?.laps_completed)
        ? ev.metadata.laps_completed
        : s.laps + 1;
      if (lc > s.laps) s.laps = lc;
      s.last_split_ts = ev.timestamp || s.last_split_ts;
      s.streak = (s.streak || 0) + 1;
    } else if (ev.event_type === 'elimination') {
      s.eliminated = true;
      s.streak = 0;
    } else if (ev.event_type === 'finish') {
      s.finished = true;
    }
  }

  function buildLeaderboard() {
    const rows = Array.from(state.entries()).map(([athlete_id, s]) => ({
      athlete_id,
      laps: s.laps,
      last_split_ts: s.last_split_ts,
      eliminated: s.eliminated,
      finished: s.finished,
      streak: s.streak
    }));

    rows.sort((a, b) => {
      if (b.laps !== a.laps) return b.laps - a.laps;
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      if (a.last_split_ts !== b.last_split_ts)
        return a.last_split_ts - b.last_split_ts;
      return a.athlete_id.localeCompare(b.athlete_id);
    });

    return rows.map((r, idx) => ({
      athlete_id: r.athlete_id,
      laps: r.laps,
      rank: idx + 1,
      streak: r.streak
    }));
  }

  function getRunnerState() {
    const out = {};
    for (const [athlete_id, s] of state.entries()) {
      out[athlete_id] = { ...s };
    }
    return out;
  }

  function update(events) {
    const started_at = Date.now();
    for (const ev of events) applyEvent(ev);
    const leaderboard = buildLeaderboard();
    const runner_state = getRunnerState();
    const finished_at = Date.now();
    const result = {
      leaderboard,
      runner_state,
      started_at,
      finished_at,
      metrics: {
        participants: leaderboard.length
      }
    };
    appendMetric('scoringEngine.update', finished_at - started_at);
    return result;
  }

  return { update };
}

export default { createScoringEngine };
