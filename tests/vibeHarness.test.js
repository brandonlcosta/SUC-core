/**************************************************
 * Vibe Harness v3
 * Purpose: Validate vibe rise/decay
 **************************************************/

import SignalEngine from "../engines/signalEngine.js";

const mockEvents = [
  { event_id: "v1", event_type: "capture", athlete_id: "a1", timestamp: Date.now() },
  { event_id: "v2", event_type: "beam_flip", athlete_id: "a2", timestamp: Date.now() + 5000 },
  { event_id: "v3", event_type: "capture", athlete_id: "a3", timestamp: Date.now() + 10000 }
];

(async function runTest() {
  console.log("\n=== Vibe Harness ===");

  try {
    const engine = new SignalEngine({ vibeDecay: 0.98, vibeBoost: 10 });
    const results = engine.processBatch(mockEvents);

    console.table(results.map(r => ({
      id: r.event_id, vibe: r.vibe_score, role: r.beat_role
    })));

    if (results[1].vibe_score <= results[0].vibe_score) throw new Error("No vibe spike on highlight");
    if (results[2].vibe_score >= results[1].vibe_score) throw new Error("No vibe decay detected");

    console.log("✅ PASS: Vibe Harness");
  } catch (err) {
    console.error("❌ FAIL: Vibe Harness →", err.message);
  }
})();
