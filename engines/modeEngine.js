/**
 * modeEngine v0.1
 * Purpose: Load a ruleset and expose templates & broadcast hints.
 * Inputs:  { rulesetPath:string } OR { ruleset:object }
 * Outputs: { getRuleset, getTemplates, getBroadcastHints }
 * Notes:   Synchronous loader; throws if ruleset invalid (via validator).
 */
import { loadRuleset } from "../utils/rulesetValidator.js";

export function createModeEngine(init = {}) {
  const ruleset =
    init.ruleset ?? loadRuleset(init.rulesetPath ?? "rulesets/backyardUltra.ruleset.json");

  function getRuleset() {
    return ruleset;
  }
  function getTemplates() {
    return ruleset.commentary_templates;
  }
  function getBroadcastHints() {
    return ruleset.broadcast_hints;
  }

  return { getRuleset, getTemplates, getBroadcastHints };
}
