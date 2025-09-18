// File: backend/services/sponsorMetrics.js

import fs from "fs";
import path from "path";
import schemaGate from "../utils/schemaGate.js";

const OUTPUT_DIR = path.join(process.cwd(), "outputs", "logs");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export class SponsorMetrics {
  constructor() {
    this.logPath = path.join(OUTPUT_DIR, "sponsorImpressions.jsonl");
  }

  /**
   * Record a sponsor impression
   * @param {string} sponsorId
   * @param {string} slot
   * @param {number} durationMs
   * @returns {Object} impression record
   */
  record(sponsorId, slot, durationMs) {
    const record = {
      ts: Date.now(),
      sponsorId,
      slot,
      durationMs,
      impressionCount: 1,
    };

    schemaGate.validate("sponsorImpressions", record);
    fs.appendFileSync(this.logPath, JSON.stringify(record) + "\n");
    return record;
  }

  /**
   * Aggregate sponsor impressions
   * @returns {Object} aggregated summary
   */
  aggregate() {
    if (!fs.existsSync(this.logPath)) return {};

    const lines = fs
      .readFileSync(this.logPath, "utf-8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    const summary = {};
    for (const rec of lines) {
      const key = `${rec.sponsorId}:${rec.slot}`;
      if (!summary[key]) {
        summary[key] = {
          sponsorId: rec.sponsorId,
          slot: rec.slot,
          totalImpressions: 0,
          totalDuration: 0,
        };
      }
      summary[key].totalImpressions += rec.impressionCount;
      summary[key].totalDuration += rec.durationMs;
    }

    return summary;
  }
}

// Named helper functions
export function recordSponsorImpression(sponsorId, slot, durationMs) {
  return sponsorMetrics.record(sponsorId, slot, durationMs);
}

export function aggregateSponsorMetrics() {
  return sponsorMetrics.aggregate();
}

// Default singleton instance
const sponsorMetrics = new SponsorMetrics();
export default sponsorMetrics;
