// File: backend/engines/broadcastEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import * as sponsorService from "../services/sponsorService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/broadcastConfig.json");

let broadcastConfig = { overlay_priority: [] };
if (fs.existsSync(configPath)) {
  broadcastConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runBroadcastEngine(events, state, ctx) {
  const overlays = [];

  ctx.meta?.rivalries?.forEach(r => {
    overlays.push({
      event_id: `rivalry_${r.athlete_ids.join("_")}`,
      overlay_type: "rivalry_card",
      athlete_ids: r.athlete_ids,
      sponsor_slot: null,
      priority: r.priority,
      timestamp: Date.now()
    });
  });

  ctx.story?.arcs?.forEach(arc => {
    overlays.push({
      event_id: `${arc.type}_${Date.now()}`,
      overlay_type: arc.type,
      athlete_ids: arc.athlete_ids || [],
      sponsor_slot: null,
      priority: arc.priority,
      timestamp: Date.now()
    });
  });

  const sponsor = sponsorService.pickSlot();
  if (sponsor) {
    overlays.push({
      event_id: `sponsor_${sponsor.id}_${Date.now()}`,
      overlay_type: "sponsor_banner",
      athlete_ids: [],
      sponsor_slot: sponsor.id,
      priority: sponsor.priority,
      timestamp: Date.now()
    });
  }

  const broadcastTick = { overlays };

  schemaGate.validate("broadcastTick", broadcastTick);

  ledgerService.event({
    engine: "broadcast",
    type: "summary",
    payload: { overlays: overlays.length }
  });

  ctx.broadcast = broadcastTick;
  return broadcastTick;
}

export class BroadcastEngine {
  run(events, state, ctx) {
    return runBroadcastEngine(events, state, ctx);
  }
}

const broadcastEngine = new BroadcastEngine();
export default broadcastEngine;
