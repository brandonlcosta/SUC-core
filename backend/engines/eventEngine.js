// File: backend/engines/eventEngine.js
// Normalizes raw events and runs the event engine pipeline

/**
 * Normalize a single raw event into a consistent schema
 * @param {Object} ev
 * @returns {Object} normalized event
 */
export function normalizeEvent(ev) {
  return {
    id: ev.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: ev.type || "unknown",
    ts: ev.ts || Date.now(),
    source: ev.source || "ingest",
    payload: ev.payload || {},
  };
}

/**
 * Run the event engine: normalize all raw events
 * @param {Array<Object>} events
 * @returns {Array<Object>} normalized events
 */
export function runEventEngine(events = []) {
  return events.map(normalizeEvent);
}

// Wrapper class for default export
export class EventEngine {
  normalize(ev) {
    return normalizeEvent(ev);
  }
  run(events) {
    return runEventEngine(events);
  }
}

// Default singleton instance
const eventEngine = new EventEngine();
export default eventEngine;
