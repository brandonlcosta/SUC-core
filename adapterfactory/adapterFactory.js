/**************************************************
 * adapterFactory v0.2
 * Purpose: Build event adapters from mapping JSON (CSV v1).
 * Inputs:  mapping (object), options { ruleset, source }
 * Outputs: Adapter: { connect, fetchEvents(since), disconnect }
 * Notes:   CSV-only parse (no quoted commas); validates event_type
 *          via ruleset; structural validation done by caller/tests.
 **************************************************/

import fs from "node:fs";
import path from "node:path";
import { validateEvent } from "../utils/rulesetValidator.js";

function toInt(v) {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}

function applyTransform(value, kind) {
  if (value == null) return value;
  switch (kind) {
    case "int": return toInt(value);
    case "float": {
      const f = Number.parseFloat(value);
      return Number.isNaN(f) ? undefined : f;
    }
    case "string": return String(value);
    default: return value;
  }
}

function setDeep(obj, pathStr, value) {
  const parts = pathStr.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function parseCsvSimple(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i]; });
    return obj;
  });
  return { headers, rows };
}

export function createAdapterFromMapping(mapping, options = {}) {
  const { ruleset, source } = options;
  const allowedTypes = new Set(ruleset?.event_types || []);
  const lastCursor = { sinceTs: 0 };
  let cachedRows = null;

  function mapRowToEvent(row) {
    const out = { metadata: {} };
    // event_type mapping
    const srcType = row[mapping.event_type_column];
    const mappedType = mapping.event_type_rules?.[srcType];
    out.event_type = mappedType;
    // column mapping
    for (const [csvCol, targetPath] of Object.entries(mapping.columns || {})) {
      const raw = row[csvCol];
      const xformKind = mapping.transforms?.[targetPath];
      const val = xformKind ? applyTransform(raw, xformKind) : raw;
      if (val !== undefined) setDeep(out, targetPath, val);
    }
    return out;
  }

  function filterAndValidate(ev) {
    if (!ev.event_type || !allowedTypes.has(ev.event_type)) {
      return { ok: false, reason: "unknown_event_type" };
    }
    const v = validateEvent(ev, ruleset);
    return v.ok ? { ok: true } : { ok: false, reason: "schema_invalid", errors: v.errors };
  }

  function loadSourceText() {
    if (!source) throw new Error("adapter source not provided");
    if (source.type === "string") return source.data;
    if (source.type === "file") {
      const abs = path.isAbsolute(source.path) ? source.path : path.join(process.cwd(), source.path);
      return fs.readFileSync(abs, "utf-8");
    }
    throw new Error(`unsupported source.type: ${source.type}`);
  }

  return {
    async connect() {
      const csvText = loadSourceText();
      const parsed = parseCsvSimple(csvText);
      cachedRows = parsed.rows;
      return true;
    },
    /** fetchEvents(since:number) → events strictly newer than 'since' */
    async fetchEvents(since = 0) {
      if (!cachedRows) throw new Error("adapter not connected");
      const out = [];
      for (const row of cachedRows) {
        const ts = toInt(row[mapping.timestamp_column]);
        if (typeof ts !== "number" || ts <= since) continue;
        const ev = mapRowToEvent(row);
        if (typeof ev.timestamp !== "number") ev.timestamp = ts;
        if (!ev.event_id) ev.event_id = String(row[mapping.id_column] ?? `${ev.event_type}_${ts}`);
        const verdict = filterAndValidate(ev);
        if (verdict.ok) out.push(ev);
      }
      lastCursor.sinceTs = Math.max(since, ...out.map(e => e.timestamp), lastCursor.sinceTs);
      return out.sort((a, b) => a.timestamp - b.timestamp);
    },
    async disconnect() { cachedRows = null; return true; },
    _debugCursor() { return { ...lastCursor }; }
  };
}
