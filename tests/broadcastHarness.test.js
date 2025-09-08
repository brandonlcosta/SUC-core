/**************************************************
 * Broadcast Harness v3
 * Purpose: Validate multi-feed broadcast output
 **************************************************/

import BroadcastEngine from "../engines/broadcastEngine.js";

const events = [
  { event_id: "b1", role: "play_by_play", line: "Athlete A scored", highlight_priority: 5, timestamp: Date.now() },
  { event_id: "b2", role: "analyst", line: "Athlete A leads!", highlight_priority: 6, timestamp: Date.now() + 1000 },
  { event_id: "b3", role: "wildcard", line: "Big brain move!", highlight_priority: 7, timestamp: Date.now() + 2000 },
  { event_id: "b4", role: "play_by_play", event_type: "beam_flip", line: "Beam flipped!", sponsor_slot: "Nike", highlight_priority: 9, timestamp: Date.now() + 3000 },
  { event_id: "b5", role: "analyst", event_type: "circle_shrink", line: "Circle shrank!", highlight_priority: 9, timestamp: Date.now() + 4000 }
];

(async function runTest() {
  console.log("\n=== Broadcast Harness ===");

  try {
    const engine = new BroadcastEngine();
    const feeds = engine.buildFeeds(events);

    for (const [feed, lines] of Object.entries(feeds)) {
      console.log(`\nFeed: ${feed.toUpperCase()} (${lines.length})`);
      console.table(lines.map(l => ({ id: l.event_id, role: l.role, line: l.line })));
    }

    if (!feeds.analyst.length) throw new Error("Analyst feed empty");
    if (!feeds.meme.length) throw new Error("Meme feed empty");
    if (!feeds.sponsor.length) throw new Error("Sponsor feed empty");
    if (!feeds.chaos.length) throw new Error("Chaos feed empty");

    console.log("✅ PASS: Broadcast Harness");
  } catch (err) {
    console.error("❌ FAIL: Broadcast Harness →", err.message);
  }
})();
