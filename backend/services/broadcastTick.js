// File: backend/services/broadcastTick.js

import fs from "fs";
import path from "path";
import { GeoService } from "./geoService.js";
import { EventEngine } from "../engines/eventEngine.js";
import { MetaEngine } from "../engines/metaEngine.js";

const OUTPUT_PATH = path.resolve("backend/outputs/broadcast/broadcastTick.json");

/**
 * BroadcastTick Service
 * Aggregates geo, events, and mode into the core broadcastTick.json
 */
export class BroadcastTickService {
  constructor() {
    this.geoService = new GeoService();
    this.eventEngine = new EventEngine();
    this.metaEngine = new MetaEngine();
  }

  /**
   * Process incoming athlete tick and emit broadcastTick.json
   * @param {Object} tick - { athlete_id, coordinates, lap, distance_km, rank, timestamp }
   */
  processTick(tick) {
    // update geo + events
    this.geoService.addPosition(tick);
    const events = this.eventEngine.processTick(tick);
    const meta = this.metaEngine.writeMeta();

    // build broadcastTick.json
    const tickPayload = {
      timestamp: tick.timestamp,
      geo_positions: this.geoService.positions,
      events,
      mode: meta.mode,
      session_id: meta.session_id,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(tickPayload, null, 2));
    return tickPayload;
  }
}
