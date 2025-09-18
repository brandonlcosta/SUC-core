// File: backend/engines/metaEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/metaConfig.json");

let metaConfig = { rivalry_threshold: 2, max_rivalries: 5 };
if (fs.existsSync(configPath)) {
  metaConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runMetaEngine(events, state, ctx) {
  const rivalries = [];
  const projections = [];
  const highlights = [];

  // Rivalries
  for (const [athlete, laps] of Object.entries(state.scoring?.laps || {})) {
    if (laps >= metaConfig.rivalry_threshold) {
      rivalries.push({ athlete_ids: [athlete], priority: 1 });
    }
  }

  // Projections (placeholder — can be replaced with real logic)
  for (const [athlete, laps] of Object.entries(state.scoring?.laps || {})) {
    projections.push({
      athlete_id: athlete,
      projected_laps: laps + 1,
      confidence: 0.75
    });
  }

  // Highlights (placeholder — pull from events)
  for (const event of events) {
    if (event.type === "capture") {
      highlights.push({
        athlete_id: event.athlete_id,
        type: "capture",
        timestamp: event.ts || Date.now()
      });
    }
  }

  const meta = {
    rivalries: rivalries.slice(0, metaConfig.max_rivalries),
    projections,
    highlights
  };

  schemaGate.validate("meta", meta);

  ledgerService.event({
    engine: "meta",
    type: "summary",
    payload: {
      rivalries: meta.rivalries.length,
      projections: meta.projections.length,
      highlights: meta.highlights.length
    }
  });

  ctx.meta = meta;
  return meta;
}

export class MetaEngine {
  run(events, state, ctx) {
    return runMetaEngine(events, state, ctx);
  }
}

const metaEngine = new MetaEngine();
export default metaEngine;
