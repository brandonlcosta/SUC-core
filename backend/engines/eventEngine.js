// File: backend/engines/eventEngine.js

import { loadConfig } from "../services/configLoader.js";

/**
 * Normalizes a raw incoming event (from BLE, LoRa, Simulator).
 * Ensures type validity based on current mode ruleset.
 *
 * @param {Object} rawEvent - incoming raw event
 * @param {string} mode - active mode, e.g. "backyardUltra", "turfWars"
 * @returns {Object} normalized event
 */
export function normalizeEvent(rawEvent, mode) {
  // Load the active mode ruleset
  const ruleset = loadConfig(`${mode}.ruleset.json`, "rulesets");

  if (!ruleset || !ruleset.event_types) {
    throw new Error(`[EventEngine] Missing event_types in ruleset for mode: ${mode}`);
  }

  if (!ruleset.event_types.includes(rawEvent.type)) {
    throw new Error(`[EventEngine] Invalid event type "${rawEvent.type}" for mode: ${mode}`);
  }

  return {
    event_id: rawEvent.id || `evt_${Date.now()}`,
    type: rawEvent.type,
    athlete_id: rawEvent.athlete_id,
    crew_id: rawEvent.crew_id || null,
    payload: rawEvent.payload || {}, // flexible payload for extensions
    timestamp: rawEvent.timestamp || Date.now(),
  };
}

/**
 * Batch normalization for multiple events at once.
 *
 * @param {Array} rawEvents - list of raw incoming events
 * @param {string} mode - active mode
 * @returns {Array} list of normalized events
 */
export function normalizeEvents(rawEvents, mode) {
  return rawEvents.map(ev => normalizeEvent(ev, mode));
}
