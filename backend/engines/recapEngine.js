// File: backend/engines/recapEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/recapConfig.json");

let recapConfig = { top_highlights: 5 };
if (fs.existsSync(configPath)) {
  recapConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runRecapEngine(events, state, ctx) {
  // ✅ Convert laps object → array
  const laps_summary = Object.entries(state.scoring?.laps || {}).map(([athlete_id, laps]) => ({
    athlete_id,
    laps
  }));

  const highlight_reel = (ctx.story?.arcs || [])
    .slice(0, recapConfig.top_highlights)
    .map((arc, i) => ({
      id: `highlight_${i + 1}`,
      type: arc.type,
      athlete_ids: arc.athlete_ids,
      timestamp: Date.now()
    }));

  const recap = { laps_summary, highlight_reel };

  schemaGate.validate("recap", recap);

  ledgerService.event({
    engine: "recap",
    type: "summary",
    payload: { highlights: highlight_reel.length, athletes: laps_summary.length }
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
