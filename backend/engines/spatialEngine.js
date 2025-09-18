// File: backend/engines/spatialEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/spatialConfig.json");

let spatialConfig = {
  update_interval_ms: 1000,
  trail_length: 10,
  checkpoint_radius_m: 25,
  default_region: "stadium"
};
if (fs.existsSync(configPath)) {
  spatialConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function runSpatialEngine(events, state, ctx) {
  const positions = {};
  const trails = {};

  for (const event of events) {
    if (event.type === "position") {
      const { athlete_id, lat, lon, ts } = event;

      positions[athlete_id] = { lat, lon, ts };

      if (!trails[athlete_id]) trails[athlete_id] = [];
      trails[athlete_id].push({ lat, lon, ts });

      if (trails[athlete_id].length > spatialConfig.trail_length) {
        trails[athlete_id].shift(); // keep only last N points
      }
    }
  }

  const spatial = {
    region: spatialConfig.default_region,
    positions,
    trails,
    checkpoints: [] // placeholder, can be filled from assets or events
  };

  schemaGate.validate("spatial", spatial);

  ledgerService.event({
    engine: "spatial",
    type: "summary",
    payload: { athletes: Object.keys(positions).length }
  });

  ctx.spatial = spatial;
  return spatial;
}

export class SpatialEngine {
  run(events, state, ctx) {
    return runSpatialEngine(events, state, ctx);
  }
}

const spatialEngine = new SpatialEngine();
export default spatialEngine;
