// File: backend/services/operatorService.js

/**
 * Operator Service
 * Applies operator overrides to engine outputs
 */

import fs from "fs";
import path from "path";

// Simple state store for active overrides
let operatorActions = [];

/**
 * Load operator actions from a file (for harness/testing mode)
 */
export function loadOperatorActions() {
  const opsPath = path.resolve("./backend/outputs/logs/operatorActions.json");
  if (fs.existsSync(opsPath)) {
    operatorActions = JSON.parse(fs.readFileSync(opsPath, "utf8"));
  }
}

/**
 * Apply overrides to scoring state
 */
export function applyScoringOverrides(scoring) {
  let modified = { ...scoring };

  operatorActions.forEach(action => {
    if (action.type === "ADJUST_LAP") {
      modified.laps[action.athlete_id] =
        (modified.laps[action.athlete_id] || 0) + action.delta;
    }
    if (action.type === "RESET_STREAK") {
      modified.streaks[action.athlete_id] = 0;
    }
  });

  return modified;
}

/**
 * Apply overrides to meta highlights
 */
export function applyMetaOverrides(meta) {
  let modified = { ...meta };

  operatorActions.forEach(action => {
    if (action.type === "PIN_RIVALRY") {
      modified.rivalries.push({
        athlete_ids: action.athlete_ids,
        priority: 10,
        override: true
      });
    }
    if (action.type === "MUTE_PROJECTION") {
      modified.projections = [];
    }
  });

  return modified;
}

/**
 * Apply overrides to story arcs
 */
export function applyStoryOverrides(arcs) {
  let modified = [...arcs];

  operatorActions.forEach(action => {
    if (action.type === "PIN_ARC") {
      modified.push({
        type: "pinned_arc",
        athlete_ids: action.athlete_ids,
        priority: 10,
        override: true
      });
    }
  });

  return modified;
}

/**
 * Apply overrides to broadcast ticks
 */
export function applyBroadcastOverrides(ticks) {
  let modified = [...ticks];

  operatorActions.forEach(action => {
    if (action.type === "ROLLBACK") {
      modified.pop(); // remove last tick
    }
    if (action.type === "MUTE_ROLE") {
      modified = modified.filter(t => t.overlay_type !== action.role);
    }
  });

  return modified;
}

/**
 * Apply overrides to recap summary
 */
export function applyRecapOverrides(recap) {
  let modified = { ...recap };

  operatorActions.forEach(action => {
    if (action.type === "REMOVE_HIGHLIGHT") {
      modified.highlight_reel = modified.highlight_reel.filter(
        h => h !== action.highlight_id
      );
    }
  });

  return modified;
}

/**
 * Apply overrides to daily summary
 */
export function applyDailyOverrides(daily) {
  let modified = { ...daily };

  operatorActions.forEach(action => {
    if (action.type === "REPLACE_SPONSOR") {
      modified.sponsor = action.newSponsor;
    }
  });

  return modified;
}

/**
 * Apply overrides to spatial overlays
 */
export function applySpatialOverrides(spatial) {
  let modified = { ...spatial };

  operatorActions.forEach(action => {
    if (action.type === "FORCE_ENVIRONMENT") {
      modified.environments = [
        { id: action.env_id, mesh_url: action.mesh_url, style: "ps1_neon" }
      ];
    }
  });

  return modified;
}
