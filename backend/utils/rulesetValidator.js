/**
 * rulesetValidator v0.1
 * Purpose: Validate ruleset JSON and normalized events against it.
 * Inputs:  ruleset (object per contract), event (normalized event)
 * Outputs: { ok:boolean, errors:string[] }
 * Notes:   Enforces snake_case keys; checks event_type membership;
 *          exported helpers: validateRuleset, validateEvent, loadRuleset.
 */


import fs from "node:fs";
import path from "node:path";

const SNAKE_RE = /^[a-z][a-z0-9_]*$/;

function collectNonSnakeCaseKeys(obj, base = "") {
  const bad = [];
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const dotted = base ? `${base}.${k}` : k;
      if (!SNAKE_RE.test(k)) bad.push(dotted);
      const v = obj[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        bad.push(...collectNonSnakeCaseKeys(v, dotted));
      }
    }
  }
  return bad;
}

function validateRulesetStructure(ruleset) {
  const errs = [];
  const requiredTop = [
    "name",
    "type",
    "description",
    "event_types",
    "metrics",
    "scoring",
    "context",
    "commentary_templates",
    "broadcast_hints"
  ];
  for (const key of requiredTop) {
    if (!(key in ruleset)) errs.push(`Missing ruleset key: ${key}`);
  }
  if (!Array.isArray(ruleset.event_types) || ruleset.event_types.length === 0) {
    errs.push("ruleset.event_types must be a non-empty array");
  }
  if (!Array.isArray(ruleset.metrics) || ruleset.metrics.length === 0) {
    errs.push("ruleset.metrics must be a non-empty array");
  }
  if (typeof ruleset.scoring !== "object") errs.push("ruleset.scoring must be an object");
  if (typeof ruleset.context !== "object") errs.push("ruleset.context must be an object");

  const roles = ["play_by_play", "analyst", "color", "wildcard"];
  const ct = ruleset.commentary_templates || {};
  for (const role of roles) {
    if (!Array.isArray(ct[role]) || ct[role].length === 0) {
      errs.push(`commentary_templates.${role} must be a non-empty array`);
    }
  }

  const bh = ruleset.broadcast_hints || {};
  if (!Array.isArray(bh.hud_overlays)) errs.push("broadcast_hints.hud_overlays must be an array");
  if (!Array.isArray(bh.highlight_triggers)) errs.push("broadcast_hints.highlight_triggers must be an array");

  return errs;
}

export function validateRuleset(ruleset) {
  const errors = [];
  if (!ruleset || typeof ruleset !== "object") {
    return { ok: false, errors: ["ruleset must be an object"] };
  }
  const badKeys = collectNonSnakeCaseKeys(ruleset);
  if (badKeys.length) {
    errors.push(`Non-snake_case keys in ruleset: ${badKeys.join(", ")}`);
  }
  errors.push(...validateRulesetStructure(ruleset));
  return { ok: errors.length === 0, errors };
}

export function validateEvent(event, ruleset) {
  const errors = [];
  if (!event || typeof event !== "object") return { ok: false, errors: ["event must be an object"] };
  if (!ruleset || typeof ruleset !== "object") return { ok: false, errors: ["ruleset must be an object"] };

  const badKeys = collectNonSnakeCaseKeys(event);
  if (badKeys.length) errors.push(`Non-snake_case keys in event: ${badKeys.join(", ")}`);

  const needed = ["event_id", "event_type", "athlete_id", "timestamp", "metadata"];
  for (const k of needed) if (!(k in event)) errors.push(`Missing event field: ${k}`);

  if (typeof event.event_id !== "string") errors.push("event_id must be string");
  if (typeof event.athlete_id !== "string") errors.push("athlete_id must be string");
  if (typeof event.timestamp !== "number") errors.push("timestamp must be unix number");
  if (typeof event.metadata !== "object") errors.push("metadata must be object");

  if (!Array.isArray(ruleset.event_types) || ruleset.event_types.length === 0) {
    errors.push("ruleset.event_types invalid");
  } else if (!ruleset.event_types.includes(event.event_type)) {
    errors.push(`event_type '${event.event_type}' not in ruleset.event_types`);
  }

  return { ok: errors.length === 0, errors };
}

export function loadRuleset(filePath) {
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  const obj = JSON.parse(raw);
  const res = validateRuleset(obj);
  if (!res.ok) {
    const msg = `Ruleset validation failed:\n- ${res.errors.join("\n- ")}`;
    throw new Error(msg);
  }
  return obj;
}

export function validateEventsBatch(events, ruleset) {
  const errors = [];
  const invalid_indices = [];
  events.forEach((ev, idx) => {
    const res = validateEvent(ev, ruleset);
    if (!res.ok) {
      invalid_indices.push(idx);
      errors.push(`event[${idx}]: ${res.errors.join("; ")}`);
    }
  });
  return { ok: errors.length === 0, errors, invalid_indices };
}
