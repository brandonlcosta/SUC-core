// File: backend/engines/scoringEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as operatorService from "../services/operatorService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/scoringConfig.json");

let scoringConfig = {
  lap_points: 1,
  streak_bonus: 5,
  capture_bonus: 10,
  max_streak: 10
};
if (fs.existsSync(configPath)) {
  scoringConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runScoringEngine(events, state, ctx) {
  const laps = {};
  const streaks = {};

  for (const event of events) {
    if (event.type === "lap") {
      const athleteId = event.athlete_id;
      laps[athleteId] = (laps[athleteId] || 0) + 1;
      streaks[athleteId] = (streaks[athleteId] || 0) + 1;
    }
  }

  const scoring = {
    laps,
    streaks,
    points: Object.fromEntries(
      Object.entries(laps).map(([athlete, lapCount]) => {
        return [athlete, lapCount * scoringConfig.lap_points + (streaks[athlete] || 0) * scoringConfig.streak_bonus];
      })
    )
  };

  schemaGate.validate("scoring", scoring);

  ledgerService.event({
    engine: "scoring",
    type: "summary",
    payload: { athletes: Object.keys(laps).length, laps: Object.values(laps).reduce((a, b) => a + b, 0) }
  });

  ctx.scoring = scoring;
  return scoring;
}

export class ScoringEngine {
  run(events, state, ctx) {
    return runScoringEngine(events, state, ctx);
  }
}

const scoringEngine = new ScoringEngine();
export default scoringEngine;
