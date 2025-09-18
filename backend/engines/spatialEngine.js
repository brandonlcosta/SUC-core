// File: backend/engines/spatialEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/spatialConfig.json");

// ✅ Safe defaults
let spatialConfig = {
  default_env: "stadium",
  default_props: ["banner"],
  default_checkpoints: ["start_line", "halfway", "finish_line"]
};

// ✅ Try loading config
if (fs.existsSync(configPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
    spatialConfig = {
      default_env: raw.default_env || "stadium",
      default_props: Array.isArray(raw.default_props) ? raw.default_props : ["banner"],
      default_checkpoints: Array.isArray(raw.default_checkpoints)
        ? raw.default_checkpoints
        : ["start_line", "halfway", "finish_line"]
    };
  } catch (err) {
    console.error("[spatialEngine] Failed to load config, using defaults:", err);
  }
}

export function runSpatialEngine(events, state, ctx) {
  // Athletes
  const athletes = Object.entries(state.scoring?.laps || {}).map(([athlete_id, laps]) => ({
    athlete_id,
    position: [Math.random() * 100, Math.random() * 100],
    laps
  }));

  // Environments
  const environments = [
    {
      id: "env_1",
      type: spatialConfig.default_env,
      active: true
    }
  ];

  // Props
  const props = spatialConfig.default_props.map((p, i) => ({
    id: `prop_${i + 1}`,
    type: p
  }));

  // ✅ Checkpoints (each tied to every athlete)
  const checkpoints = [];
  for (const athlete of athletes) {
    spatialConfig.default_checkpoints.forEach((label, i) => {
      checkpoints.push({
        runner_id: athlete.athlete_id,
        checkpoint_id: `cp_${i + 1}`,
        label,
        position: [i * 50, 0] // mock positions
      });
    });
  }

  const spatial = {
    athletes,
    environments,
    props,
    checkpoints
  };

  schemaGate.validate("spatial", spatial);

  ledgerService.event({
    engine: "spatial",
    type: "summary",
    payload: {
      athletes: athletes.length,
      environments: environments.length,
      props: props.length,
      checkpoints: checkpoints.length
    }
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
