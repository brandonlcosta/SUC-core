/**************************************************
 * Replay Harness v3
 * Purpose: Validate log → replay equivalence
 **************************************************/

import SignalEngine from "../engines/signalEngine.js";
import { writeLog, readLog } from "../utils/logWriter.js";

const events = [
  { event_id: "r1", event_type: "capture", athlete_id: "a1", timestamp: Date.now() },
  { event_id: "r2", event_type: "beam_flip", athlete_id: "a2", timestamp: Date.now() + 5000 }
];

(async function runTest() {
  console.log("\n=== Replay Harness ===");

  try {
    const sessionId = Date.now();
    const engine = new SignalEngine();

    const signals = engine.processBatch(events);
    signals.forEach(s => writeLog(sessionId, s));

    const replayed = readLog(sessionId);

    console.table(replayed.map(r => ({ id: r.event_id, vibe: r.vibe_score })));

    if (JSON.stringify(signals) !== JSON.stringify(replayed)) throw new Error("Replay mismatch");

    console.log("✅ PASS: Replay Harness");
  } catch (err) {
    console.error("❌ FAIL: Replay Harness →", err.message);
  }
})();
