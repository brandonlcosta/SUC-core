/**************************************************
 * Recap Builder v1.0
 * Purpose: Generate recap bundles from session logs
 * Inputs: sessionId (string)
 * Outputs: Recap JSON with highlights + summary
 **************************************************/

import { readLog } from "../../engines/loggerEngine.js";

/**
 * Build a recap package for a session
 * @param {string} sessionId - session identifier
 * @returns {object} recap JSON
 */
export function buildRecap(sessionId) {
  const logs = readLog(sessionId);

  if (!logs || logs.length === 0) {
    return {
      sessionId,
      highlights: [],
      summary: "No logs available for this session",
    };
  }

  // Filter by type and package into highlights
  const highlights = logs
    .filter((entry) => entry.type === "commentary" || entry.type === "scoring")
    .map((entry) => ({
      timestamp: entry.timestamp,
      type: entry.type,
      detail: entry.payload,
    }));

  return {
    sessionId,
    totalEntries: logs.length,
    highlightCount: highlights.length,
    highlights,
    summary: `Session ${sessionId} recap with ${highlights.length} highlights.`,
  };
}
