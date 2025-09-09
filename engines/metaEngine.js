// /engines/metaEngine.js
// Meta Engine v2 — computes consistent highlight_priority (1–10)
// Inputs: normalized events (id, ts, athlete_id, team_id?, event_type, metrics{})
// State: streaks, rivalries, lastSplits, gaps
// Outputs: enriched events:
// { base_statement, context, projection, highlight_priority, narrative_type[] }
//
// Design notes:
// - Config over code: accepts {weights, thresholds} at construction; sensible defaults inline.
// - Pure reducer + small factory; no IO. <=300 LOC, ESM, single responsibility.
// - Deterministic: no randomness; identical inputs => identical priorities.
//
// Public API (stable):
//   createMetaEngine(opts?): { state, reduce(action) }
//   metaReducer(state, action)  // pure, for harness
//
// Actions supported:
//   { type: 'INGEST_EVENTS', payload: { events: [] , ts } }
//   { type: 'RESET' }
//
// Normalized Event expectations (minimal):
//   { id, ts, athlete_id, event_type, score?, position?, metrics?: { split_s?, pace_s_per_km?, gap_s_to_leader? } }
//
// Narrative detection:
//   - STREAK: consecutive positive beats for athlete (PASS or fast split vs last split by > threshold)
//   - RIVALRY: two athletes trade lead or remain within small gap over time
//   - COMEBACK: athlete's gap_to_leader shrinking across consecutive ticks
//   - PR: event_type === 'PERSONAL_RECORD'
//
// Priority model (1..10):
//   raw = w_rivalry*intensity + w_streak*streak + w_pr*bool(PR) + w_comeback*rate
//   clamp + quantize to 1..10
//
// This engine does *not* read disk. External systems can pass ruleset-derived
// thresholds via opts to avoid hardcoding.
export function createMetaEngine(opts = {}) {
  const defaults = {
    weights: { rivalry: 3.0, streak: 1.2, pr: 4.0, comeback: 2.0 },
    thresholds: {
      fast_split_pct: 0.02,   // 2% faster than previous split counts as "positive"
      rivalry_gap_s: 2.5,     // within 2.5s counts toward rivalry intensity
      rivalry_decay: 0.92,    // exponential decay per tick
      streak_min: 2,          // start emitting from 2-in-a-row
      comeback_window: 3,     // consecutive ticks to consider for trend
      emit_min_priority: 4,   // only emit highlights >= 4
      quantize_steps: 10
    }
  };
  const config = {
    weights: { ...defaults.weights, ...(opts.weights || {}) },
    thresholds: { ...defaults.thresholds, ...(opts.thresholds || {}) }
  };
  const engine = {
    state: initialState(config),
    reduce(action) {
      this.state = metaReducer(this.state, action);
      return this.state._emitted || [];
    }
  };
  return engine;
}

function initialState(config) {
  return {
    _cfg: config,
    tick: 0,
    // per-athlete
    streaks: new Map(),            // athlete_id -> count
    lastSplit: new Map(),          // athlete_id -> last split seconds
    gapTrend: new Map(),           // athlete_id -> array of last N gap_s_to_leader values
    // rivalries
    rivalry: new Map(),            // "a|b" -> { intensity, lastLeader }
    // emissions (cleared every reduce)
    _emitted: []
  };
}

// ---- Reducer ----
export function metaReducer(prev, action) {
  const state = cloneState(prev);
  state._emitted = [];
  switch (action?.type) {
    case 'RESET':
      return initialState(state._cfg);
    case 'INGEST_EVENTS': {
      const { events = [], ts } = action.payload || {};
      state.tick += 1;
      for (const e of events) {
        processEvent(state, e, ts);
      }
      return state;
    }
    default:
      return state;
  }
}

// ---- Internal helpers ----
function cloneState(s) {
  // Shallow clone; Maps reused (mutated) intentionally
  return { ...s };
}

function processEvent(state, e, ts) {
  const cfg = state._cfg;
  const id = e.athlete_id;
  // --- STREAKS ---
  const positive = isPositiveBeat(state, e, cfg);
  const streak = (state.streaks.get(id) || 0);
  const newStreak = positive ? streak + 1 : 0;
  if (positive || streak) state.streaks.set(id, newStreak);

  // --- GAP TREND (for COMEBACK) ---
  const gap = numberOrNull(e.metrics?.gap_s_to_leader);
  if (gap != null) {
    const win = cfg.thresholds.comeback_window;
    const arr = state.gapTrend.get(id) || [];
    arr.push(gap);
    if (arr.length > win) arr.shift();
    state.gapTrend.set(id, arr);
  }

  // --- RIVALRY ---
  updateRivalry(state, e);

  // --- SIGNALS + EMIT ---
  const signals = gatherSignals(state, e);
  const priority = quantizePriority(scoreSignals(signals, cfg.weights), cfg.thresholds.quantize_steps);
  if (priority >= cfg.thresholds.emit_min_priority) {
    const enriched = toEnriched(e, signals, priority, ts);
    state._emitted.push(enriched);
  }
}

function isPositiveBeat(state, e, cfg) {
  const t = e.event_type;
  if (t === 'PASS' || t === 'LEAD_CHANGE') return true;
  if (t === 'PERSONAL_RECORD') return true;
  const split = numberOrNull(e.metrics?.split_s);
  if (split != null) {
    const prev = state.lastSplit.get(e.athlete_id);
    state.lastSplit.set(e.athlete_id, split);
    if (prev != null && split < prev * (1 - cfg.thresholds.fast_split_pct)) {
      return true;
    }
  }
  return false;
}

function updateRivalry(state, e) {
  // Build pair key if we can infer leader/opponent from metrics
  const leader = e.metrics?.leader_athlete_id;
  const me = e.athlete_id;
  if (!leader || leader === me) {
    // Could still decay existing intensities globally
    decayAllRivalries(state, state._cfg.thresholds.rivalry_decay);
    return;
  }
  const a = String(me), b = String(leader);
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  const node = state.rivalry.get(key) || { intensity: 0, lastLeader: null };
  const gap = numberOrNull(e.metrics?.gap_s_to_leader);
  if (gap != null && gap <= state._cfg.thresholds.rivalry_gap_s) {
    // close = add intensity
    node.intensity = Math.min(10, node.intensity * 0.9 + 1.5);
  } else {
    node.intensity = node.intensity * state._cfg.thresholds.rivalry_decay;
  }
  // lead changes bump
  if (e.event_type === 'LEAD_CHANGE') {
    node.intensity = Math.min(10, node.intensity + 2.5);
    node.lastLeader = me;
  }
  state.rivalry.set(key, node);
  // also decay others slightly
  decayAllRivalries(state, state._cfg.thresholds.rivalry_decay, key);
}

function decayAllRivalries(state, factor, skipKey) {
  for (const [k, v] of state.rivalry.entries()) {
    if (k === skipKey) continue;
    v.intensity = v.intensity * factor;
  }
}

function gatherSignals(state, e) {
  const id = e.athlete_id;
  const streak = state.streaks.get(id) || 0;
  const comeback = computeComebackRate(state.gapTrend.get(id));
  const rivalry = maxRivalryForAthlete(state, id);
  const isPR = e.event_type === 'PERSONAL_RECORD';
  const types = [];
  if (rivalry > 0.5) types.push('rivalry');
  if (streak >= (state._cfg.thresholds.streak_min || 2)) types.push('streak');
  if (isPR) types.push('pr');
  if (comeback > 0) types.push('comeback');
  return { streak, comeback, rivalry, isPR, narrative_type: types };
}

function computeComebackRate(arr) {
  if (!arr || arr.length < 2) return 0;
  // positive if decreasing (closing gap)
  let sum = 0;
  for (let i = 1; i < arr.length; i++) sum += (arr[i-1] - arr[i]);
  return Math.max(0, sum / (arr.length - 1)); // seconds per tick closed
}

function maxRivalryForAthlete(state, id) {
  const nid = String(id);
  let m = 0;
  for (const [key, node] of state.rivalry.entries()) {
    const [a,b] = key.split('|');
    if (a === nid || b === nid) m = Math.max(m, node.intensity || 0);
  }
  return m;
}

function scoreSignals(sig, w) {
  return sig.rivalry * w.rivalry + sig.streak * w.streak + (sig.isPR ? w.pr : 0) + sig.comeback * w.comeback;
}
function quantizePriority(raw, steps) {
  const x = Math.max(1, Math.min(10, Math.round(raw)));
  // Ensure within steps (normally 10 → 1..10)
  return Math.max(1, Math.min(steps, x));
}

function toEnriched(e, signals, priority, ts) {
  const base_statement = pickBaseStatement(e, signals);
  const projection = makeProjection(e);
  const context = {
    athlete_id: e.athlete_id,
    position: e.position ?? null,
    gap_s_to_leader: numberOrNull(e.metrics?.gap_s_to_leader),
    streak: signals.streak,
    rivalry_intensity: Number(signals.rivalry.toFixed(2)),
    is_pr: signals.isPR
  };
  return {
    base_statement,
    context,
    projection,
    highlight_priority: priority,
    narrative_type: signals.narrative_type,
    ts: e.ts ?? ts,
    base: e
  };
}

function pickBaseStatement(e, sig) {
  if (sig.isPR) return 'Personal record!';
  if (sig.narrative_type.includes('rivalry') && e.event_type === 'LEAD_CHANGE') return 'Lead change in a live rivalry!';
  if (sig.narrative_type.includes('comeback')) return 'Closing the gap — live comeback.';
  if (sig.narrative_type.includes('streak')) return `On a streak (${sig.streak})`;
  return 'Momentum building.';
}

function makeProjection(e) {
  // trivial pace projection: if split_s available, extrapolate next split ±5%
  const split = numberOrNull(e.metrics?.split_s);
  if (split == null) return null;
  const nextSplit = +(split * 0.98).toFixed(2);
  return { next_split_s: nextSplit };
}

function numberOrNull(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }

export default { createMetaEngine, metaReducer };
