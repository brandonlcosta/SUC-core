// File: backend/engines/dailyEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as sponsorService from "../services/sponsorService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/dailyConfig.json");

let dailyConfig = { top_n: 5, anchors_limit: 2, default_sponsor: "default_sponsor" };
if (fs.existsSync(configPath)) {
  dailyConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runDailyEngine(events, state, ctx) {
  const today = new Date().toISOString().split("T")[0];

  const anchors = (ctx.story?.arcs || [])
    .sort((a, b) => b.priority - a.priority)
    .slice(0, dailyConfig.anchors_limit);

  const sponsor = sponsorService.pickSlot()?.id || dailyConfig.default_sponsor;

  const clips = (ctx.recap?.highlight_reel || [])
    .slice(0, dailyConfig.top_n)
    .map((arc, i) => ({
      clip_id: `clip_${i + 1}`,
      type: arc.type || "generic",
      athlete_ids: arc.athlete_ids || [],
      timestamp: arc.timestamp || Date.now()
    }));

  // ✅ Schema-compliant daily object
  const daily = {
    date: today,
    anchors,
    sponsor,
    clips
  };

  schemaGate.validate("daily", daily);

  ledgerService.event({
    engine: "daily",
    type: "summary",
    payload: { anchors: anchors.length, clips: clips.length, sponsor }
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
