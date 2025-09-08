/**************************************************
 * Timing Harness v3
 * Purpose: Validate pacing intervals
 **************************************************/

import SignalEngine from "../engines/signalEngine.js";

const mockEvents = [
  { event_id: "t1", event_type: "capture", timestamp: Date.now() },
  { event_id: "t2", event_type: "beam_flip", timestamp: Date.now() + 5000 },
  { event_id: "t3", event_type: "capture", timestamp: Date.now() + 10000 }
];

(async function runTest() {
  console.log("\n=== Timing Harness ===");

  try {
    const engine = new SignalEngine();
    const results = engine.processBatch(mockEvents);

    console.table(results.map(r => ({ id: r.event_id, vibe: r.vibe_score })));

    if (results[2].timestamp - results[1].timestamp !== 5000) throw new Error("Bad pacing interval");

    console.log("✅ PASS: Timing Harness");
  } catch (err) {
    console.error("❌ FAIL: Timing Harness →", err.message);
  }
})();
