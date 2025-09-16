// /backend/engines/sponsorEngine.js
// Reducer: manages sponsor slots, TTL enforcement, and impression logging

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const LOG_PATH = path.resolve("./outputs/logs/sponsorImpressions.jsonl");
const SCHEMA_PATH = path.resolve("./backend/schemas/sponsor.schema.json");

/**
 * Reducer: apply sponsor logic to broadcast state
 * @param {Object} state - current broadcast state
 * @param {Object} action - sponsor action { type, slotId, sponsorId, ttl }
 * @returns {Object} updated state
 */
export function sponsorReducer(state = {}, action = {}) {
  if (!action || !action.type) return state;

  switch (action.type) {
    case "SPONSOR_IMPRESSION": {
      const { slotId, sponsorId, ttl } = action;
      if (!slotId || !sponsorId) return state;

      const updatedSlot = {
        sponsorId,
        slotId,
        ttl: ttl || 30,
        lastServed: Date.now(),
      };

      const updatedState = {
        ...state,
        sponsors: {
          ...(state.sponsors || {}),
          [slotId]: updatedSlot,
        },
      };

      logImpression(updatedSlot);
      return updatedState;
    }
    default:
      return state;
  }
}

/**
 * Log sponsor impression to JSONL file
 * @param {Object} impression
 */
function logImpression(impression) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, JSON.stringify({ ...impression, loggedAt: Date.now() }) + "\n");
}

/**
 * Run sponsor engine and persist state
 * @param {Object} state
 * @param {Object} action
 * @returns {Object} updated state
 */
export function runSponsorEngine(state, action) {
  const updated = sponsorReducer(state, action);

  const valid = validateAgainstSchema(SCHEMA_PATH, updated);
  if (!valid) {
    console.error("❌ SponsorEngine schema validation failed");
    return state;
  }

  return updated;
}

export default runSponsorEngine;
