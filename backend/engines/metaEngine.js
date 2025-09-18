// File: backend/engines/metaEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as operatorService from "../services/operatorService.js";
import fs from "fs";
import path from "path";

const configPath = path.resolve("./backend/configs/metaConfig.json");
const metaConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

export function runMetaEngine(events, state, ctx) {
  const rivalries = detectRivalries(state);
  const projections = calculateProjections(state);
  const highlights = prioritizeHighlights(events, rivalries, projections);

  let metaData = { rivalries, projections, highlights };

  metaData = operatorService.applyMetaOverrides(metaData);

  schemaGate.validate("meta", metaData);

  ledgerService.event({
    engine: "meta",
    type: "summary",
    payload: {
      rivalries: rivalries.length,
      projections: projections.length,
      highlights: highlights.length
    }
  });

  ctx.meta = metaData;
  return metaData;
}

export class MetaEngine {
  run(events, state, ctx) {
    return runMetaEngine(events, state, ctx);
  }
}

const metaEngine = new MetaEngine();
export default metaEngine;

/* --------------------------
   Internal Helpers
--------------------------- */

function detectRivalries(state) {
  const detected = [];
  const threshold = metaConfig.rivalry.threshold_seconds;

  state.runners.forEach((runnerA, i) => {
    state.runners.slice(i + 1).forEach(runnerB => {
      const gap = Math.abs(runnerA.time - runnerB.time);
      if (gap <= threshold) {
        detected.push({
          type: "rivalry",
          athlete_ids: [runnerA.id, runnerB.id],
          gap_seconds: gap,
          priority: metaConfig.rivalry.priority
        });
      }
    });
  });

  return detected;
}

function calculateProjections(state) {
  return state.runners.map(runner => ({
    athlete_id: runner.id,
    projected_finish: runner.laps * metaConfig.projection.lap_factor,
    confidence: "medium"
  }));
}

function prioritizeHighlights(events, rivalries, projections) {
  const highlights = [];

  rivalries.forEach(r => highlights.push({ type: "rivalry", data: r, priority: r.priority }));
  projections.forEach(p => highlights.push({ type: "projection", data: p, priority: metaConfig.projection.priority }));
  events.forEach(e => {
    if (e.type === "lap_complete") {
      highlights.push({ type: "lap", data: e, priority: metaConfig.lap.priority });
    }
  });

  return highlights.sort((a, b) => b.priority - a.priority);
}
