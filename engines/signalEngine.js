/**************************************************
 * Signal Engine v1.1
 * Purpose: Fuse pacing + meta into SUC's beat spine
 * Inputs: normalized events
 * Outputs: signal objects (vibe_score, beat_role, sponsor_slots, arc_ref)
 **************************************************/

import { validateSignal } from "../utils/schemaValidator.js";

export class SignalEngine {
  constructor(config = {}) {
    this.vibeDecay = config.vibeDecay || 0.95;   // vibe drops each tick
    this.vibeBoost = config.vibeBoost || 5;      // base boost per highlight
    this.currentVibe = 0;
    this.lastTimestamp = null;
  }

  processEvent(event) {
    // Highlight triggers boost vibe
    const isHighlight = ["beam_flip", "full_send", "finish"].includes(event.event_type);
    if (isHighlight) {
      this.currentVibe += this.vibeBoost;
    }

    // Vibe decay based on elapsed time
    if (this.lastTimestamp) {
      const delta = (event.timestamp - this.lastTimestamp) / 1000;
      this.currentVibe *= Math.pow(this.vibeDecay, delta);
    }
    this.lastTimestamp = event.timestamp;

    // Beat role classification
    let beatRole = "echo";
    if (this.currentVibe > 20) beatRole = "impact";
    else if (this.currentVibe < 5) beatRole = "chaos";

    // Arc continuity reference
    const arc_ref = event.arc_ref || `${event.athlete_id || "anon"}_${event.event_type}`;

    const signal = {
      event_id: event.event_id,
      vibe_score: Math.round(this.currentVibe),
      beat_role: beatRole,
      sponsor_slot: event.sponsor_slot || null,
      arc_ref,
      timestamp: event.timestamp
    };

    if (!validateSignal(signal)) {
      throw new Error(`Invalid signal output: ${JSON.stringify(signal)}`);
    }

    return signal;
  }

  processBatch(events) {
    return events.map(e => this.processEvent(e));
  }
}

export default SignalEngine;
