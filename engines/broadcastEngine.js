// /suc-core/engines/broadcastEngine.js
// Broadcast Engine v2 — integrates Meta → Story → Commentary → SponsorGate.
// ESM, ≤300 LOC, no external deps.
// API:
//   const be = createBroadcastEngine({ sponsorConfig, commentaryConfig })
//   const out = be.tick({ ts, events, triggers })
// Returns per tick:
//   { ts, ticker, hud:{ overlays, lines }, highlights:{ arcs }, recap:{ manifest } }
//
// Notes:
// - Config-over-code: pass sponsor slots + commentary (templates/personas/pacing).
// - Fail-closed logging: metrics JSONL only; no hard file outputs for feeds.
// - Deterministic ordering: ticker by highlight_priority desc, then recency.

import { createMetaEngine } from './metaEngine.js';
import { createStoryEngine } from './storyEngine.js';
import { createCommentaryEngine } from './commentaryEngine.js';
import { createSponsorGate } from '../utils/sponsorGate.js';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

export function createBroadcastEngine(opts = {}) {
  const {
    sponsorConfig = { slots: [] },
    commentaryConfig = {},
    metricsPath = '/outputs/logs/metrics.jsonl',
    recapMax = 12
  } = opts;

  const meta = createMetaEngine(opts.meta || {});
  const story = createStoryEngine(opts.story || {});
  const comms = createCommentaryEngine({ logging: { filePath: null }, ...(commentaryConfig || {}) });
  const sGate = createSponsorGate(sponsorConfig);

  const state = {
    recap: [],        // rolling top-arc manifest
    metricsPath,
    recapMax,
    lastTickTs: 0
  };

  return {
    state,
    tick({ ts = Date.now(), events = [], triggers = [] } = {}) {
      const t0 = now();
      // Stage 1: Meta enrichment
      const m0 = now();
      const enriched = meta.reduce({ type: 'INGEST_EVENTS', payload: { ts, events } });
      const m1 = now();

      // Stage 2: Arcs
      const a0 = now();
      const arcs = story.reduce({ type: 'INGEST_ENRICHED', payload: { ts, events: enriched } });
      const a1 = now();

      // Stage 3: Sponsors
      const s0 = now();
      const overlays = sGate.plan({ ts, triggers: triggersFrom(enriched, arcs, triggers) });
      const s1 = now();

      // Stage 4: Commentary (role-balanced)
      const c0 = now();
      const commLines = comms.reduce({ type: 'TICK', payload: { ts, arcs } });
      const c1 = now();

      // Stage 5: Surfaces
      const ticker = makeTicker(enriched, arcs);
      const hud = { overlays, lines: commLines };
      const highlights = { arcs };
      updateRecap(state, arcs);

      // Metrics
      const out = {
        ts,
        ticker,
        hud,
        highlights,
        recap: { manifest: state.recap }
      };
      stampMetrics(state.metricsPath, {
        ts,
        stage: 'broadcast_tick',
        durations_ms: {
          meta: m1 - m0,
          story: a1 - a0,
          sponsors: s1 - s0,
          commentary: c1 - c0,
          total: now() - t0
        },
        events_processed: events.length,
        schema_errors_pct: 0,       // upstream Event Engine guarantees validity in this phase
        p95_latency_ms: null        // computed by external aggregator; omitted here
      });

      state.lastTickTs = ts;
      return out;
    }
  };
}

// ---- helpers ----
function makeTicker(enriched, arcs) {
  // Prioritize enriched events by highlight_priority; fallback to arc titles when present
  const items = [];
  for (const ev of enriched) {
    items.push({
      text: ev.base_statement,
      priority: ev.highlight_priority || 1,
      arc_id: findArcIdForAthlete(arcs, ev.context?.athlete_id) || null,
      ts: ev.ts
    });
  }
  // also allow top arc titles into ticker as headline bumps
  const topArc = arcs?.[0];
  if (topArc) {
    items.push({
      text: `${label(topArc.arc_type)} — ${topArc.title}`,
      priority: Math.max(1, Math.min(10, Math.round(topArc.priority || 1))),
      arc_id: topArc.arc_id,
      ts: topArc.updated_ts
    });
  }
  items.sort((a, b) => (b.priority - a.priority) || ((b.ts || 0) - (a.ts || 0)));
  // Deduplicate consecutive identical texts
  return dedupe(items, x => x.text);
}

function label(type) {
  return type === 'rivalry' ? 'RIVALRY' :
         type === 'comeback' ? 'COMEBACK' :
         type === 'dominance' ? 'DOMINANCE' :
         type === 'underdog' ? 'UNDERDOG' : type.toUpperCase();
}

function findArcIdForAthlete(arcs, aId) {
  if (!aId || !arcs?.length) return null;
  const hit = arcs.find(a => a.a_id === aId || a.b_id === aId);
  return hit?.arc_id || null;
}

function triggersFrom(enriched, arcs, external = []) {
  const set = new Set(external);
  if (enriched.some(e => e.narrative_type?.includes('rivalry'))) set.add('rivalry');
  if (enriched.some(e => e.narrative_type?.includes('comeback'))) set.add('comeback');
  if (enriched.some(e => e.narrative_type?.includes('pr'))) set.add('pr');
  if (arcs?.length && arcs[0]?.priority >= 8) set.add('highlight_peak');
  return [...set];
}

function dedupe(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k); out.push(x);
  }
  return out;
}

function updateRecap(state, arcs) {
  if (!Array.isArray(arcs) || !arcs.length) return;
  // Keep a rolling list of the highest-priority arc snapshots
  const top = arcs[0];
  const entry = {
    ts: top.updated_ts,
    arc_id: top.arc_id,
    title: top.title,
    arc_type: top.arc_type,
    priority: Math.round(Math.max(1, Math.min(10, top.priority || 1)))
  };
  // avoid duplicates
  const exists = state.recap.some(r => r.arc_id === entry.arc_id);
  if (!exists) {
    state.recap.unshift(entry);
    if (state.recap.length > state.recapMax) state.recap.pop();
  }
}

function stampMetrics(path, record) {
  try {
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(path, JSON.stringify(record) + '\n');
  } catch { /* fail-closed */ }
}
function now(){ return Date.now(); }

export default { createBroadcastEngine };
