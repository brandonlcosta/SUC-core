// /suc-core/engines/storyEngine.js
// Story Engine v1 — assemble rivalry & comeback arcs from enriched events
// Inputs: array of enriched events from Meta v2 per tick
//   Enriched event (required fields):
//   { ts, base_statement, narrative_type[], highlight_priority, context:{athlete_id, ...}, base:{ position? }, projection? }
// Output: list of arcs (new/updated/closed) per reduce call
//   Arc shape:
//   { arc_id, arc_type: 'rivalry'|'comeback', title, beats:[{ts, statement, pri, a_id, b_id?}], projection, priority, status:'open'|'closed', started_ts, updated_ts }
//
// Public API:
//   createStoryEngine(opts?): { state, reduce({type:'INGEST_ENRICHED', payload:{events, ts}}) }
//   storyReducer(state, action)
//
// Config surface (config-over-code):
//   {
//     thresholds: { start_priority_min, inactivity_timeout_ms, max_beats },
//     titles: { rivalry, comeback },
//     weights: { priority_decay }
//   }
//
// Notes:
// - No IO, ESM, single-file, <=300 LOC.
// - Arcs keyed by rivalry pair (a|b) or by athlete_id for comeback.
// - Inactivity closes arcs; projection mirrors most recent contributing beat.
export function createStoryEngine(opts = {}) {
  const defaults = {
    thresholds: {
      start_priority_min: 5,
      inactivity_timeout_ms: 45_000, // ms of no contributing beats → close
      max_beats: 8
    },
    titles: {
      rivalry: (a,b) => `Trading Blows: ${a} vs ${b}`,
      comeback: (a) => `Closing In: ${a}'s Comeback`
    },
    weights: {
      priority_decay: 0.92 // decay per tick for arc headline priority smoothing
    },
    idFormat: 'auto' // reserved
  };
  const cfg = {
    thresholds: { ...defaults.thresholds, ...(opts.thresholds || {}) },
    titles: { ...defaults.titles, ...(opts.titles || {}) },
    weights: { ...defaults.weights, ...(opts.weights || {}) }
  };
  const engine = {
    state: initialState(cfg),
    reduce(action) {
      this.state = storyReducer(this.state, action);
      return this.state._emitted || [];
    }
  };
  return engine;
}

function initialState(cfg) {
  return {
    _cfg: cfg,
    tick: 0,
    // active arcs
    rivalryArcs: new Map(),  // key "a|b" -> Arc
    comebackArcs: new Map(), // key athlete_id -> Arc
    // output of last reduce
    _emitted: []
  };
}

export function storyReducer(prev, action) {
  const s = { ...prev, _emitted: [] };
  switch (action?.type) {
    case 'RESET': return initialState(s._cfg);
    case 'INGEST_ENRICHED': {
      const { events = [], ts = Date.now() } = action.payload || {};
      s.tick += 1;
      // decay priorities slightly for smoothness
      decayArcPriorities(s);

      for (const ev of events) {
        if (!Array.isArray(ev.narrative_type)) continue;
        if (ev.narrative_type.includes('rivalry')) {
          handleRivalryBeat(s, ev, ts);
        }
        if (ev.narrative_type.includes('comeback')) {
          handleComebackBeat(s, ev, ts);
        }
      }
      // close inactive arcs
      sweepInactive(s, ts);
      // collate updated arcs for emission (only deltas)
      s._emitted = collectDeltas(s);
      clearTouched(s);
      return s;
    }
    default: return s;
  }
}

// ---------- Arc handlers ----------
function handleRivalryBeat(s, ev, ts) {
  const a = String(ev.context.athlete_id);
  const b = String(ev.base?.metrics?.leader_athlete_id || ev.context.leader_athlete_id || 'unknown');
  if (!b || b === 'unknown' || b === a) return;
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  let arc = s.rivalryArcs.get(key);
  if (!arc) {
    if (ev.highlight_priority < s._cfg.thresholds.start_priority_min) return;
    arc = makeArc('rivalry', s, ts, { a, b });
    arc.title = s._cfg.titles.rivalry(a, b);
    s.rivalryArcs.set(key, arc);
  }
  ingestBeat(arc, ev, ts);
}

function handleComebackBeat(s, ev, ts) {
  const a = String(ev.context.athlete_id);
  let arc = s.comebackArcs.get(a);
  if (!arc) {
    if (ev.highlight_priority < s._cfg.thresholds.start_priority_min) return;
    arc = makeArc('comeback', s, ts, { a });
    arc.title = s._cfg.titles.comeback(a);
    s.comebackArcs.set(a, arc);
  }
  ingestBeat(arc, ev, ts);
}

function makeArc(type, s, ts, ids) {
  const base = {
    arc_id: `${type}:${ids.a}${ids.b ? `|${ids.b}`:''}:${ts}`,
    arc_type: type,
    title: '',
    beats: [],
    projection: null,
    priority: 0,
    status: 'open',
    started_ts: ts,
    updated_ts: ts,
    _touched: true
  };
  if (type === 'rivalry') { base.a_id = ids.a; base.b_id = ids.b; }
  if (type === 'comeback') { base.a_id = ids.a; }
  return base;
}

function ingestBeat(arc, ev, ts) {
  const beat = {
    ts: ev.ts ?? ts,
    statement: ev.base_statement,
    pri: ev.highlight_priority,
    a_id: String(ev.context.athlete_id),
    b_id: arc.arc_type === 'rivalry' ? (arc.a_id === String(ev.context.athlete_id) ? arc.b_id : arc.a_id) : undefined
  };
  // push beat with cap
  arc.beats.push(beat);
  if (arc.beats.length > arc._cfg?.thresholds?.max_beats) {
    arc.beats.shift();
  }
  // update rolling projection & priority
  arc.projection = ev.projection ?? arc.projection;
  // Headline priority: max of last 3 beats (smoothed by decay applied globally)
  const last3 = arc.beats.slice(-3).map(b => b.pri);
  const localMax = last3.length ? Math.max(...last3) : 0;
  arc.priority = Math.max(arc.priority, localMax);
  arc.updated_ts = ts;
  arc._touched = true;
}

function decayArcPriorities(s) {
  const f = s._cfg.weights.priority_decay;
  for (const arc of s.rivalryArcs.values()) arc.priority *= f;
  for (const arc of s.comebackArcs.values()) arc.priority *= f;
}

function sweepInactive(s, ts) {
  const idle = s._cfg.thresholds.inactivity_timeout_ms;
  for (const [k, arc] of s.rivalryArcs.entries()) {
    if (arc.status === 'open' && ts - arc.updated_ts > idle) {
      arc.status = 'closed'; arc._touched = true;
    }
    if (arc.status === 'closed' && ts - arc.updated_ts > idle * 2) {
      s.rivalryArcs.delete(k);
    }
  }
  for (const [k, arc] of s.comebackArcs.entries()) {
    if (arc.status === 'open' && ts - arc.updated_ts > idle) {
      arc.status = 'closed'; arc._touched = true;
    }
    if (arc.status === 'closed' && ts - arc.updated_ts > idle * 2) {
      s.comebackArcs.delete(k);
    }
  }
}

function collectDeltas(s) {
  const out = [];
  for (const arc of s.rivalryArcs.values()) if (arc._touched) out.push(stripPrivate(arc, s));
  for (const arc of s.comebackArcs.values()) if (arc._touched) out.push(stripPrivate(arc, s));
  // sort by priority desc, then recent update
  out.sort((x,y) => (y.priority - x.priority) || (y.updated_ts - x.updated_ts));
  return out;
}

function clearTouched(s) {
  for (const arc of s.rivalryArcs.values()) arc._touched = false;
  for (const arc of s.comebackArcs.values()) arc._touched = false;
}

function stripPrivate(arc, s) {
  // bake cfg for max_beats access when trimming
  const maxBeats = s._cfg.thresholds.max_beats;
  return {
    arc_id: arc.arc_id,
    arc_type: arc.arc_type,
    title: arc.title,
    beats: arc.beats.slice(-maxBeats),
    projection: arc.projection,
    priority: Math.round(Math.max(1, Math.min(10, arc.priority))),
    status: arc.status,
    started_ts: arc.started_ts,
    updated_ts: arc.updated_ts,
    a_id: arc.a_id,
    b_id: arc.b_id
  };
}

export default { createStoryEngine, storyReducer };
