// /backend/engines/commentaryEngine.js
import { normalizeEvent } from "./eventEngine.js";

// Simple runner name resolver (could use rosterEngine later)
function getRunnerName(runnerId) {
  const roster = {
    r123: "Alice",
    r456: "Bob"
  };
  return roster[runnerId] || runnerId;
}

/**
 * Generate commentary line for a given event
 * @param {Object} rawEvent
 * @returns {Object} commentary entry
 */
export function generateCommentary(rawEvent) {
  const event = normalizeEvent(rawEvent);
  const name = getRunnerName(event.runner_id);
  let text = "";

  switch (event.event_type) {
    case "lap_completed":
      text = `${name} completes a lap!`;
      break;
    case "sector_ping":
      text = `${name} passes ${event.location?.sector_name || "a checkpoint"}`;
      break;
    case "projected_position":
      text = `${name} projected on ${event.location?.sector_name || "course route"}`;
      break;
    case "highlight_reel":
      text = `${name} featured in highlight reel`;
      break;
    case "health_ping":
      text = `Health ping received from ${event.source.device_id}`;
      break;
    default:
      text = `${name || "Unknown"} event: ${event.event_type}`;
  }

  return {
    timestamp: event.timestamp,
    runner_id: event.runner_id,
    text
  };
}
