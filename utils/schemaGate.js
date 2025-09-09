/**
 * schemaGate v0.1
 * Purpose: Fail-closed validation wrapper for normalized events.
 * Inputs:  { event, ruleset }
 * Outputs: { ok:boolean, event?:object, errors?:string[] }
 * Notes:   Uses rulesetValidator; enforces SLO drop-on-fail pattern.
 */
import { validateEvent } from "./rulesetValidator.js";

export function validateOrDrop(event, ruleset) {
  const res = validateEvent(event, ruleset);
  if (res.ok) return { ok: true, event: { ...event, validated: true } };
  return { ok: false, errors: res.errors };
}
