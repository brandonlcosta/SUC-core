// File: backend/engines/rosterEngine.js

import schemaGate from "../services/schemaGate.js";
import ledgerService from "../services/ledgerService.js";
import operatorService from "../services/operatorService.js";
import rosterService from "../services/rosterService.js";

/**
 * Named export for pipelineService
 * Builds schema-compliant roster.json from source roster service
 */
export function runRosterEngine(events, state, ctx) {
  // Base roster pulled from rosterService
  let roster = rosterService.getRoster();

  // Apply operator overrides (rename athlete, change crew, etc.)
  roster = operatorService.applyRosterOverrides(roster);

  // Validate against schema
  schemaGate.validate("roster", { athletes: roster });

  // Ledger logging
  ledgerService.event({
    engine: "roster",
    type: "summary",
    payload: { athletes: roster.length }
  });

  // Enrich pipeline context
  ctx.roster = roster;

  return { athletes: roster };
}

/**
 * Optional class for extendability
 */
export class RosterEngine {
  run(events, state, ctx) {
    return runRosterEngine(events, state, ctx);
  }
}

/**
 * Default singleton export
 */
const rosterEngine = new RosterEngine();
export default rosterEngine;
