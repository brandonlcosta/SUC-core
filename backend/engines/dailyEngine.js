// File: backend/engines/dailyEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as sponsorService from "../services/sponsorService.js";
import fs from "fs";
import path from "path";

const configPath = path.resolve("./backend/configs/dailyConfig.json");
let dailyConfig = { top_n: 5 };
if (fs.existsSync(configPath)) {
  dailyConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runDailyEngine(events, state, ctx) {
  const today = new Date().toISOString().split("T")[0];

  // Anchors = at least empty array
  const anchors = (ctx.story?.arcs || [])
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  // Sponsor = always at least a placeholder
  const sponsor = sponsorService.pickSlot() || { id: "default_sponsor", priority: 0 };

  // Clips = at least empty array
  const clips = (ctx.recap?.highlight_reel || [])
    .slice(0, dailyConfig.top_n)
    .map((arc, i) => ({
      clip_id: `clip_${i + 1}`,
      type: arc.type || "generic",
      athlete_ids: arc.athlete_ids || (arc.athlete_id ? [arc.athlete_id] : []),
      timestamp: arc.timestamp || Date.now()
    }));

  // Build schema-compliant object
  const daily = {
    date: today,
    anchors,
    sponsor,
    clips
  };

  // Validate against schema
  schemaGate.validate("daily", daily);

  // Ledger summary
  ledgerService.event({
    engine: "daily",
    type: "summary",
    payload: {
      anchor_count: anchors.length,
      clip_count: clips.length,
      sponsor_id: sponsor.id
    }
  });

  ctx.daily = daily;
  return daily;
}

export class DailyEngine {
  run(events, state, ctx) {
    return runDailyEngine(events, state, ctx);
  }
}

const dailyEngine = new DailyEngine();
export default dailyEngine;
