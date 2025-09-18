// File: backend/services/broadcastTick.js
// Service for generating + persisting broadcast ticks according to schema

import fs from "fs";
import path from "path";
import { ensureOutputDir, OUTPUT_DIR } from "../utils/paths.js";

const BROADCAST_DIR = path.join(OUTPUT_DIR, "broadcast");
const LOGS_DIR = path.join(OUTPUT_DIR, "logs");
const TICK_FILE = path.join(BROADCAST_DIR, "broadcastTick.json");
const TICK_LOG = path.join(LOGS_DIR, "broadcastTicks.jsonl");

export class BroadcastTickService {
  constructor() {
    ensureOutputDir();
    fs.mkdirSync(BROADCAST_DIR, { recursive: true });
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  /**
   * Build a broadcast tick aligned with broadcastTick.schema.json
   * @param {Object} params
   * @param {string} params.event_id
   * @param {string} params.overlay_type - e.g. "rivalry_card", "lap_update"
   * @param {Array<string>} params.athlete_ids
   * @param {string} [params.sponsor_slot]
   * @param {number} [params.priority]
   * @param {number} [params.timestamp]
   */
  buildTick({ event_id, overlay_type, athlete_ids, sponsor_slot, priority = 5, timestamp = Date.now() }) {
    return {
      event_id,
      overlay_type,
      athlete_ids,
      sponsor_slot,
      priority,
      timestamp,
    };
  }

  /**
   * Write tick to JSON file + append to log
   * @param {Object} tick
   */
  writeTick(tick) {
    fs.writeFileSync(TICK_FILE, JSON.stringify(tick, null, 2));
    fs.appendFileSync(TICK_LOG, JSON.stringify(tick) + "\n");
    return tick;
  }

  /**
   * Create + persist a tick from parameters
   */
  emitTick(params) {
    const tick = this.buildTick(params);
    return this.writeTick(tick);
  }
}

// Named helpers
export function buildBroadcastTick(params) {
  return broadcastTickService.buildTick(params);
}

export function emitBroadcastTick(params) {
  return broadcastTickService.emitTick(params);
}

// Default singleton instance
const broadcastTickService = new BroadcastTickService();
export default broadcastTickService;
