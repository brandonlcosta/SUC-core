// File: backend/engines/eventEngine.js

import fs from "fs";
import path from "path";

const OUTPUT_PATH = path.resolve("backend/outputs/broadcast/events.json");

/**
 * EventEngine
 * Detects key race milestones and emits events for overlays.
 */
export class EventEngine {
  constructor() {
    this.lastLeader = null;
    this.completedSplits = new Set();
  }

  /**
   * Process an athlete tick and detect milestone events
   * @param {Object} tick - { athlete_id, lap, distance_km, rank, timestamp }
   * @returns {Array} events - array of event objects
   */
  processTick(tick) {
    const events = [];

    // Marathon: split milestones
    if (tick.distance_km && [5, 10, 21, 42].includes(tick.distance_km)) {
      const key = `${tick.athlete_id}_${tick.distance_km}`;
      if (!this.completedSplits.has(key)) {
        this.completedSplits.add(key);
        events.push({
          event_id: `split_${tick.distance_km}k`,
          athlete_id: tick.athlete_id,
          distance_km: tick.distance_km,
          timestamp: tick.timestamp,
        });
      }
    }

    // Backyard Ultra: lap completed
    if (tick.lap && tick.lap > 0) {
      events.push({
        event_id: "lap_completed",
        athlete_id: tick.athlete_id,
        lap: tick.lap,
        timestamp: tick.timestamp,
      });
    }

    // Leader change
    if (tick.rank === 1 && this.lastLeader !== tick.athlete_id) {
      this.lastLeader = tick.athlete_id;
      events.push({
        event_id: "new_leader",
        athlete_id: tick.athlete_id,
        lap: tick.lap,
        timestamp: tick.timestamp,
      });
    }

    if (events.length > 0) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(events, null, 2));
    }

    return events;
  }
}
