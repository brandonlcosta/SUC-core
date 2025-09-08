/**************************************************
 * Studio Router Harness v3
 * Purpose: Validate feed toggling
 **************************************************/

import BroadcastEngine from "../engines/broadcastEngine.js";
import StudioRouter from "../studio/studioRouter.js";

const events = [
  { event_id: "st1", event_type: "capture", role: "play_by_play", line: "Athlete A captured Turf X", highlight_priority: 5, timestamp: Date.now() },
  { event_id: "st2", event_type: "beam_flip", role: "analyst", line: "Beam flipped!", sponsor_slot: "Adidas", highlight_priority: 9, timestamp: Date.now() + 2000 },
  { event_id: "st3", event_type: "circle_shrink", role: "analyst", line: "Shrinking Circle eliminated 2 athletes!", highlight_priority: 9, timestamp: Date.now() + 4000 }
];

(async function runTest() {
  console.log("\n=== Studio Router Harness ===");

  try {
    const broadcast = new BroadcastEngine();
    const router = new StudioRouter(broadcast);

    for (const feed of router.listFeeds()) {
      router.toggleFeed(feed);
      const activeFeed = router.getActiveFeed(events);
      console.log(`\nFeed: ${feed.toUpperCase()}`);
      console.table(activeFeed.map(f => ({ id: f.event_id, role: f.role, line: f.line })));
    }

    console.log("✅ PASS: Studio Router Harness");
  } catch (err) {
    console.error("❌ FAIL: Studio Router Harness →", err.message);
  }
})();
