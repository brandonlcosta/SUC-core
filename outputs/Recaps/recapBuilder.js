/**************************************************
 * Recap Builder
 * Purpose: Build recap bundle from deterministic logs
 **************************************************/

import { readLog } from "../../utils/logWriter.js";

export function buildRecap(sessionId, minPriority = 8) {
  const signals = readLog(sessionId);

  const highlights = signals
    .filter(s => (s.highlight_priority ?? s.vibe_score) >= minPriority)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(s => ({
      event_id: s.event_id,
      vibe_score: s.vibe_score,
      arc_ref: s.arc_ref,
      timestamp: s.timestamp,
      line: s.line || `Event ${s.event_id} (vibe ${s.vibe_score})`
    }));

  const recap = {
    session: sessionId,
    total_signals: signals.length,
    highlights
  };

  console.log("\n[Recap Builder] Recap generated:");
  console.dir(recap, { depth: null });

  return recap;
}
