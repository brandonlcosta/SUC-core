/**************************************************
 * Shrinking Circle Harness v3
 * Purpose: Validate elimination + chaos feed
 **************************************************/

import ModeEngine from "../engines/modeEngine.js";
import BroadcastEngine from "../engines/broadcastEngine.js";

const event = {
  event_id: "s1",
  event_type: "circle_shrink",
  role: "analyst",
  line: "Shrinking Circle eliminated 2 athletes!",
  metadata: { eliminated: ["a1", "a2"] },
  highlight_priority: 9,
  timestamp: Date.now()
};

(async function runTest() {
  console.log("\n=== Shrinking Circle Harness ===");

  try {
    const mode = new ModeEngine("./configs/rulesets.json");
    const broadcast = new BroadcastEngine();

    mode.applyShrinkingCircle(event);
    if (!mode.isEliminated("a1")) throw new Error("Athlete not eliminated");

    const feeds = broadcast.buildFeeds([event]);
    console.table(feeds.chaos.map(c => ({ id: c.event_id, line: c.line })));

    if (!feeds.chaos.length) throw new Error("Chaos feed empty");

    console.log("✅ PASS: Shrinking Circle Harness");
  } catch (err) {
    console.error("❌ FAIL: Shrinking Circle Harness →", err.message);
  }
})();
