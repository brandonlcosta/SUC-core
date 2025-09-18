// File: backend/engines/spatialEngine.js

import schemaGate from "../services/schemaGate.js";
import ledgerService from "../services/ledgerService.js";
import operatorService from "../services/operatorService.js";
import assets from "../../frontend/assets/assets.json" assert { type: "json" };

/**
 * Named export for pipelineService
 * Maps events + geo state to environment/prop overlays
 */
export function runSpatialEngine(events, state, ctx) {
  let spatial = {
    environments: [],
    checkpoints: [],
    props: []
  };

  // Map environment (active race environment from assets.json)
  if (state.mode?.environment_id) {
    const env = assets.find(a => a.id === state.mode.environment_id);
    if (env) {
      spatial.environments.push({
        id: env.id,
        mesh_url: env.mesh_url,
        style: env.style
      });
    }
  }

  // Add checkpoints (from scoring state)
  if (state.scoring?.laps) {
    spatial.checkpoints = Object.keys(state.scoring.laps).map(runnerId => ({
      runner_id: runnerId,
      checkpoint_id: `cp_${state.scoring.laps[runnerId]}`,
      timestamp: Date.now()
    }));
  }

  // Add sponsor props (aid station coolers, flags, etc.)
  events
    .filter(e => e.type === "prop_spawn")
    .forEach(e => {
      const prop = assets.find(a => a.id === e.asset_id);
      if (prop) {
        spatial.props.push({
          id: prop.id,
          mesh_url: prop.mesh_url || null,
          sponsor: prop.sponsor || null
        });
      }
    });

  // Operator overrides (force environment, add/remove props)
  spatial = operatorService.applySpatialOverrides(spatial);

  // Validate schema
  schemaGate.validate("spatial", spatial);

  // Ledger logging
  ledgerService.event({
    engine: "spatial",
    type: "summary",
    payload: {
      environments: spatial.environments.length,
      checkpoints: spatial.checkpoints.length,
      props: spatial.props.length
    }
  });

  // Enrich pipeline context
  ctx.spatial = spatial;

  return spatial;
}

/**
 * Optional class for extendability
 */
export class SpatialEngine {
  run(events, state, ctx) {
    return runSpatialEngine(events, state, ctx);
  }
}

/**
 * Default singleton export
 */
const spatialEngine = new SpatialEngine();
export default spatialEngine;
