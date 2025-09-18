// File: backend/engines/scoringEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as operatorService from "../services/operatorService.js";
import fs from "fs";
import path from "path";

const configPath = path.resolve("./backend/configs/scoringConfig.json");
const scoringConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

export function runScoringEngine(events, state, ctx) {
  let scoring = { laps: {}, streaks: {}, captures: [] };

  events.forEach(e => {
    switch (e.type) {
      case "lap_complete":
        scoring.laps[e.athlete_id] = (scoring.laps[e.athlete_id] || 0) + 1;
        break;
      case "streak":
        scoring.streaks[e.athlete_id] = e.value;
        break;
      case "capture":
        scoring.captures.push({
          athlete_id: e.athlete_id,
          zone: e.zone,
          timestamp: e.timestamp
        });
        break;
    }
  });

  state.scoring = {
    laps: { ...state.scoring?.laps, ...scoring.laps },
    streaks: { ...state.scoring?.streaks, ...scoring.streaks },
    captures: [...(state.scoring?.captures || []), ...scoring.captures]
  };

  state.scoring = operatorService.applyScoringOverrides(state.scoring);

  schemaGate.validate("scoring", state.scoring);

  ledgerService.event({
    engine: "scoring",
    type: "summary",
    payload: {
      laps: Object.keys(state.scoring.laps).length,
      streaks: Object.keys(state.scoring.streaks).length,
      captures: state.scoring.captures.length
    }
  });

  ctx.scoring = state.scoring;
  return state.scoring;
}

export class ScoringEngine {
  run(events, state, ctx) {
    return runScoringEngine(events, state, ctx);
  }
}

const scoringEngine = new ScoringEngine();
export default scoringEngine;
