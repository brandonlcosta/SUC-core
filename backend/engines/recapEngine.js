// File: backend/engines/recapEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";

const configPath = path.resolve("./backend/configs/recapConfig.json");
let recapConfig = { top_n: 3 };
if (fs.existsSync(configPath)) {
  recapConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runRecapEngine(events, state, ctx) {
  // Always return required properties
  const laps_summary = Object.entries(state.scoring?.laps || {})
    .sort(([, a], [, b]) => b - a)
    .map(([athlete_id, laps]) => ({ athlete_id, laps }));

  const highlight_reel = (ctx.story?.arcs || [])
    .sort((a, b) => b.priority - a.priority)
    .slice(0, recapConfig.top_n);

  const recap = {
    laps_summary,
    highlight_reel
  };

  // Validate against schema
  schemaGate.validate("recap", recap);

  // Log to ledger
  ledgerService.event({
    engine: "recap",
    type: "summary",
    payload: {
      laps_summary_count: laps_summary.length,
      highlight_count: highlight_reel.length
    }
  });

  ctx.recap = recap;
  return recap;
}

export class RecapEngine {
  run(events, state, ctx) {
    return runRecapEngine(events, state, ctx);
  }
}

const recapEngine = new RecapEngine();
export default recapEngine;
