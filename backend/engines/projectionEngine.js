// File: backend/engines/projectionEngine.js

import { validateEvent } from "./eventEngine.js";

/**
 * Projection Engine
 * Emits projected_position events at intervals to simulate gliding runners.
 */
export function createProjectionEvent({ runner_id, lat, lon, sector_name }) {
  const evt = {
    event_type: "projected_position",
    runner_id,
    timestamp: new Date().toISOString(),
    location: {
      lat,
      lon,
      sector_name,
    },
    source: {
      system: "projection_engine",
      device_id: "proj_01",
      method: "pace_interpolation",
    },
    quality: {
      confidence: 0.6,
      priority: 0.25,
      trust_level: "projection",
    },
    meta: {
      note: "synthetic projection",
    },
  };

  return validateEvent(evt);
}

/**
 * Generate projection events for a set of runners.
 * For demo: just jitter positions slightly forward each tick.
 */
export function projectRunners(runners = []) {
  return runners.map((runner) => {
    const lat = runner.lastLat + (Math.random() - 0.5) * 0.001;
    const lon = runner.lastLon + (Math.random() - 0.5) * 0.001;

    return createProjectionEvent({
      runner_id: runner.id,
      lat,
      lon,
      sector_name: runner.sector_name || "Unknown",
    });
  });
}

// ✅ Default export for clean imports
export default {
  createProjectionEvent,
  projectRunners,
};
