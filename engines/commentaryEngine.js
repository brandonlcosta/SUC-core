// /suc-core/engines/commentaryEngine.js
// Commentary Engine — templates → optional riff → role balance, pacing, dedupe.
// Inputs per tick: { ts, arcs: [{ arc_id, arc_type, title, beats[], projection, priority, status, a_id, b_id? }] }
// Config (config-over-code):
//   {
//     templates: {
//       rivalry: { play_by_play:[], analyst:[], color:[], wildcard:[] },
//       comeback:{ ... }
//     },
//     personas: { play_by_play:{prefix?, suffix?}, analyst:{...}, color:{...}, wildcard:{...} },
//     pacing: { maxLinesPerTick: 8, maxLinesPerArc: 4 },
//     dedupe: { window_s: 20 },
//     riff?: (lineCtx) => string | null,   // optional async-free hook to tweak a line
//     logging: { filePath: '/outputs/logs/commentary.jsonl' | null }
//   }
//
// Output per tick: array of lines:
//   { ts, arc_id, role:'play_by_play'|'analyst'|'color'|'wildcard', text, priority, arc_type }
//
// Notes:
// - Strict role balance: we emit at least one line per role for the highest-priority arcs in the tick,
//   subject to pacing caps. If templates exhausted, we fallback to safe generics.
// - Dedupe: no identical text within window_s across recent lines. If deduped, we try next template.
// - No external deps. ESM. ≤300 LOC.
//
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const ROLES = ['play_by_play', 'analyst', 'color', 'wildcard'];

export function createCommentaryEngine(opts = {}) {
  const defaults = {
    templates: {
      rivalry: {
        play_by_play: ['{a} takes the lead over {b}!', 'Lead change: {a} vs {b}!'],
        analyst: ['Volatile lead—expect a surge soon.', 'Rivalry intensity trending up.'],
        color: ['This duel is electric out there.', 'Two athletes, one road—no backing down.'],
        wildcard: ['Clip this—pure drama.', 'Someone call the highlight reel.']
      },
      comeback: {
        play_by_play: ['{a} is closing fast—gap down to {gap}s.', '{a} reels them in—momentum flips.'],
        analyst: ['Sustained negative split trend indicates a real comeback.'],
        color: ['Crowd senses the swing—noise rising.'],
        wildcard: ['This has “turning point” written all over it.']
      }
    },
    personas: {
      play_by_play: { prefix: '', suffix: '' },
      analyst: { prefix: '', suffix: '' },
      color: { prefix: '', suffix: '' },
      wildcard: { prefix: '', suffix: '' }
    },
    pacing: { maxLinesPerTick: 8, maxLinesPerArc: 4 },
    dedupe: { window_s: 20 },
    riff: null,
    logging: { filePath: '/outputs/logs/commentary.jsonl' }
  };
  const cfg = deepMerge(defaults, opts);
  const engine = {
    state: initialState(cfg),
    reduce(action) {
      this.state = commentaryReducer(this.state, action);
      return this.state._emitted || [];
    }
  };
  return engine;
}

function initialState(cfg) {
  return {
    _cfg: cfg,
    tick: 0,
    recent: [], // [{text, ts}]
    templateIdx: new Map(), // roleKey (arcType|role) -> next index
    _emitted: []
  };
}

export function commentaryReducer(prev, action) {
  const s = { ...prev, _emitted: [] };
  if (action?.type === 'RESET') return initialState(s._cfg);
  if (action?.type !== 'TICK') return s;

  const { ts = Date.now(), arcs = [] } = action.payload || {};
  s.tick += 1;

  // Sort arcs by priority desc and recency
  const sorted = [...arcs].sort((a,b) => (b.priority - a.priority) || (b.updated_ts - a.updated_ts));
  const out = [];

  // Emit lines role-balanced, arc by arc, until pacing cap
  const caps = s._cfg.pacing;
  for (const arc of sorted) {
    if (out.length >= caps.maxLinesPerTick) break;
    const neededRoles = rolesForArc(arc);
    const perArcLines = [];
    for (const role of neededRoles) {
      if (perArcLines.length >= caps.maxLinesPerArc) break;
      const line = craftLine(s, arc, role, ts);
      if (!line) continue;
      if (isDuplicate(s, line.text, ts)) {
        // try another variant
        const alt = craftLine(s, arc, role, ts, /*forceNext*/ true);
        if (alt && !isDuplicate(s, alt.text, ts)) perArcLines.push(alt);
      } else {
        perArcLines.push(line);
      }
      if (out.length + perArcLines.length >= caps.maxLinesPerTick) break;
    }
    out.push(...perArcLines);
    if (out.length >= caps.maxLinesPerTick) break;
  }

  // Update recent + log
  for (const ln of out) remember(s, ln);
  if (s._cfg.logging?.filePath) safeAppendJSONL(s._cfg.logging.filePath, out);

  s._emitted = out;
  return s;
}

// ---------- helpers ----------
function rolesForArc(_arc) {
  // Always attempt the four roles per highlight cycle.
  return ROLES;
}

function craftLine(s, arc, role, ts, forceNext = false) {
  const tbank = s._cfg.templates[arc.arc_type] || {};
  const bank = tbank[role] || [];
  const key = `${arc.arc_type}|${role}`;
  let idx = s.templateIdx.get(key) || 0;
  if (forceNext) idx = (idx + 1) % Math.max(1, bank.length);

  const tpl = bank.length ? bank[idx % bank.length] : generic(role, arc.arc_type);
  const filled = fillTemplate(tpl, arc);
  const persona = s._cfg.personas[role] || {};
  const text = `${persona.prefix || ''}${filled}${persona.suffix || ''}`.trim();

  // Optional riff hook
  let riffed = null;
  if (typeof s._cfg.riff === 'function') {
    try { riffed = s._cfg.riff({ arc, role, text, ts }) || null; } catch { /* ignore riff errors */ }
  }
  const finalText = (riffed && typeof riffed === 'string') ? riffed : text;

  // advance pointer if we used a template
  s.templateIdx.set(key, (idx + 1) % Math.max(1, bank.length || 1));
  return {
    ts,
    arc_id: arc.arc_id,
    arc_type: arc.arc_type,
    role,
    text: finalText,
    priority: arc.priority
  };
}

function fillTemplate(tpl, arc) {
  const a = arc.a_id || 'A';
  const b = arc.b_id || 'B';
  const gap = (() => {
    const last = arc.beats?.[arc.beats.length - 1];
    return last && typeof last.gap_s === 'number' ? last.gap_s : extractGapFromBeatStatement(last?.statement);
  })();
  const proj = arc.projection?.next_split_s ? `${arc.projection.next_split_s}s` : null;

  return tpl
    .replaceAll('{a}', a)
    .replaceAll('{b}', b)
    .replaceAll('{gap}', (gap ?? '?'))
    .replaceAll('{proj_next_split}', (proj ?? ''));
}

function extractGapFromBeatStatement(s) {
  if (!s) return null;
  const m = /(\d+(?:\.\d+)?)s/.exec(s);
  return m ? Number(m[1]) : null;
}

function generic(role, arcType) {
  if (role === 'play_by_play') return arcType === 'rivalry' ? '{a} vs {b}—lead in flux.' : '{a} is closing—comeback on.';
  if (role === 'analyst') return arcType === 'rivalry' ? 'Lead volatility favors late moves.' : 'Trend suggests momentum shift.';
  if (role === 'color') return arcType === 'rivalry' ? 'Two rivals, one stretch—sparks flying.' : 'Crowd rides the swell.';
  return 'One for the reels.';
}

function isDuplicate(s, text, ts) {
  const winMs = (s._cfg.dedupe?.window_s || 20) * 1000;
  const cutoff = ts - winMs;
  // purge old
  s.recent = s.recent.filter(x => x.ts >= cutoff);
  return s.recent.some(x => x.text === text);
}

function remember(s, line) {
  s.recent.push({ text: line.text, ts: line.ts });
}

function safeAppendJSONL(filePath, lines) {
  try {
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const payload = lines.map(l => JSON.stringify(l)).join('\n') + '\n';
    appendFileSync(filePath, payload);
  } catch { /* fail-closed on logging */ }
}

function deepMerge(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b || {})) {
    const v = b[k];
    if (isObj(v) && isObj(a[k])) out[k] = deepMerge(a[k], v);
    else out[k] = v;
  }
  return out;
}
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);

export default { createCommentaryEngine, commentaryReducer };
