import fs from "fs";
import path from "path";
import schemaGate from "../utils/schemaGate.js";

const OUTPUT_DIR = path.join(process.cwd(), "outputs", "logs");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export class SponsorExchange {
  constructor() {
    this.logPath = path.join(OUTPUT_DIR, "sponsorImpressions.jsonl");
    this.activeSlots = new Map(); // slot -> { sponsorId, expiresAt, impressions }
  }

  /**
   * Activate a sponsor slot with TTL.
   * @param {string} sponsorId
   * @param {string} slot
   * @param {number} ttlMs
   */
  activateSlot(sponsorId, slot, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.activeSlots.set(slot, { sponsorId, expiresAt, impressions: 0 });
  }

  /**
   * Tick: update impressions for active sponsors.
   * @param {number} deltaMs - how long this tick was visible
   */
  tick(deltaMs) {
    const now = Date.now();
    for (const [slot, state] of this.activeSlots.entries()) {
      if (now > state.expiresAt) {
        this.activeSlots.delete(slot);
        continue;
      }

      state.impressions++;
      const record = {
        ts: now,
        sponsorId: state.sponsorId,
        slot,
        durationMs: deltaMs,
        impressionCount: state.impressions
      };

      // Schema validation
      schemaGate.validate("sponsorImpressions", record);

      // Append to log
      fs.appendFileSync(this.logPath, JSON.stringify(record) + "\n");
    }
  }
}

// Singleton export
export default new SponsorExchange();
