// File: backend/engines/recapEngine.js

import schemaGate from "../services/schemaGate.js";
import ledgerService from "../services/ledgerService.js";
import recapService from "../services/recapService.js";
import operatorService from "../services/operatorService.js";

/**
 * Named export for pipelineService
 * Summarizes state + story → recap.json
 */
export function runRecapEngine(events, state, ctx) {
  // Build recap data from recapService (laps, highlights, arcs)
  let recap = recapService.buildRecap(state, ctx);

  // Apply operator overrides (pin highlight, skip clip, etc.)
  recap = operatorService.applyRecapOverrides(recap);

  // Validate schema
  schemaGate.validate("recap", recap);

  // Ledger logging
  ledgerService.event({
    engine: "recap",
    type: "summary",
    payload: {
      laps_summary: recap.laps_summary?.length || 0,
      highlight_reel: recap.highlight_reel?.length || 0
    }
  });

  // Enrich pipeline context
  ctx.recap = recap;

  return recap;
}

/**
 * Optional class for extendability
 */
export class RecapEngine {
  run(events, state, ctx) {
    return runRecapEngine(events, state, ctx);
  }
}

/**
 * Default singleton export
 */
const recapEngine = new RecapEngine();
export default recapEngine;
