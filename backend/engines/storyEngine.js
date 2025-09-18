// File: backend/engines/storyEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as operatorService from "../services/operatorService.js";
import fs from "fs";
import path from "path";

const configPath = path.resolve("./backend/configs/storyConfig.json");
const storyConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

export function runStoryEngine(events, state, ctx) {
  const arcs = buildArcs(events, ctx.meta);

  const finalArcs = operatorService.applyStoryOverrides(arcs);

  schemaGate.validate("story", { arcs: finalArcs });

  ledgerService.event({
    engine: "story",
    type: "summary",
    payload: { arcs: finalArcs.length }
  });

  ctx.story = { arcs: finalArcs };
  return { arcs: finalArcs };
}

export class StoryEngine {
  run(events, state, ctx) {
    return runStoryEngine(events, state, ctx);
  }
}

const storyEngine = new StoryEngine();
export default storyEngine;

/* --------------------------
   Internal Helpers
--------------------------- */

function buildArcs(events, meta) {
  const arcs = [];

  meta?.rivalries?.forEach(r => {
    arcs.push({
      type: "rivalry_arc",
      athlete_ids: r.athlete_ids,
      gap_seconds: r.gap_seconds,
      priority: storyConfig.rivalry.priority
    });
  });

  const comebackThreshold = storyConfig.comeback.lap_gain;
  events.forEach(e => {
    if (e.type === "lap_gain" && e.value >= comebackThreshold) {
      arcs.push({
        type: "comeback_arc",
        athlete_id: e.athlete_id,
        gain: e.value,
        priority: storyConfig.comeback.priority
      });
    }
  });

  const streakThreshold = storyConfig.dominance.streak;
  events.forEach(e => {
    if (e.type === "streak" && e.value >= streakThreshold) {
      arcs.push({
        type: "dominance_arc",
        athlete_id: e.athlete_id,
        streak: e.value,
        priority: storyConfig.dominance.priority
      });
    }
  });

  return arcs.sort((a, b) => b.priority - a.priority);
}
