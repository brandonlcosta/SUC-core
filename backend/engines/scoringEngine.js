/**
 * Scoring Engine
 * Applies trust priority: truth > soft > projection.
 * Updates lap counts based on events.
 */

const PRIORITY_ORDER = {
  truth: 3,
  soft: 2,
  projection: 1
};

const state = {
  runners: {}
};

export function updateScoring(event) {
  const { runner_id, event_type, quality } = event;
  if (!runner_id) return;

  if (!state.runners[runner_id]) {
    state.runners[runner_id] = { laps: 0, last_event: null };
  }

  const runner = state.runners[runner_id];
  const incomingPriority = PRIORITY_ORDER[quality.trust_level] || 0;
  const currentPriority = runner.last_event
    ? PRIORITY_ORDER[runner.last_event.quality.trust_level]
    : 0;

  // Only update if higher or equal priority
  if (incomingPriority >= currentPriority) {
    if (event_type === "lap_completed") {
      runner.laps += 1;
    }
    runner.last_event = event;
  }
}

export function getLeaderboard() {
  return Object.entries(state.runners).map(([id, data]) => ({
    runner_id: id,
    laps: data.laps
  }));
}

export function resetScoring() {
  Object.keys(state.runners).forEach((k) => delete state.runners[k]);
}
