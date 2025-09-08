/**************************************************
 * Event Engine v1.0
 * Purpose: Normalize raw adapter events into schema
 * Inputs: adapter.fetchEvents() outputs
 * Outputs: clean events validated against ruleset
 **************************************************/

import { validateEvent } from "../utils/schemaValidator.js";

export class EventEngine {
  constructor(ruleset) {
    this.ruleset = ruleset;
  }

  normalizeEvent(raw) {
    const event = {
      event_id: raw.event_id || `${raw.athlete_id}-${Date.now()}`,
      event_type: raw.event_type,
      athlete_id: raw.athlete_id,
      crew: raw.crew || null,
      turf: raw.turf || null,
      timestamp: raw.timestamp || Date.now(),
      metadata: raw.metadata || {}
    };

    if (!validateEvent(event, this.ruleset)) {
      throw new Error(`Invalid event: ${JSON.stringify(event)}`);
    }
    return event;
  }

  normalizeBatch(rawEvents) {
    return rawEvents.map(e => this.normalizeEvent(e));
  }
}

export default EventEngine;
