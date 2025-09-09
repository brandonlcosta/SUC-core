/**
 * scoringEngine v0.1
 * Purpose: Maintain leaderboard and runner_state from normalized events.
 * Inputs:  update(events:Array<NormalizedEvent>)
 *          NormalizedEvent = {
 *            event_id:string, event_type:'lap_split'|'elimination'|'finish',
 *            athlete_id:string, timestamp:number, metadata:{ lap?:number, laps_completed?:number }
 *          }
 * Outputs: {
 *   leaderboard: [{ athlete_id, laps, rank, streak }],
 *   runner_state: { [athlete_id]: { laps, eliminated, finished, last_split_ts, streak } },
 *   started_at, finished_at, metrics
 * }
 * Notes:   Deterministic; no I/O. Tie-breaker: laps desc, then latest last_split_ts asc.
 */
export function createScoringEngine() {
  const state = new Map(); // athlete_id -> { laps, eliminated, finished, last_split_ts, streak }

  function ensure(athlete_id) {
    if (!state.has(athlete_id)) {
      state.set(athlete_id, { laps: 0, eliminated: false, finished: false, last_split_ts: 0, streak: 0 });
    }
    return state.get(athlete_id);
  }

  function applyEvent(ev) {
    const s = ensure(ev.athlete_id);
    if (ev.event_type === "lap_split") {
      // prefer explicit laps_completed if present; otherwise increment
      const lc = Number.isFinite(ev.metadata?.laps_completed) ? ev.metadata.laps_completed : s.laps + 1;
      // guard against going backwards
      if (lc > s.laps) s.laps = lc;
      s.last_split_ts = ev.timestamp || s.last_split_ts;
      s.streak = (s.streak || 0) + 1;
    } else if (ev.event_type === "elimination") {
      s.eliminated = true;
      s.streak = 0;
    } else if (ev.event_type === "finish") {
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
      // primary: laps desc
      if (b.laps !== a.laps) return b.laps - a.laps;
      // secondary: elimination status (not eliminated before eliminated)
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      // tertiary: earlier last split first (closer to cutoff gets higher rank)
      if (a.last_split_ts !== b.last_split_ts) return a.last_split_ts - b.last_split_ts;
      // stable by athlete_id
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
    return {
      leaderboard,
      runner_state,
      started_at,
      finished_at,
      metrics: {
        participants: leaderboard.length
      }
    };
  }

  return { update };
}
