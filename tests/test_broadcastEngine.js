import broadcastEngine from "../backend/engines/broadcastEngine.js";

try {
  broadcastEngine.process({
    ts: Date.now(),
    ticker: "Runner A takes the lead!",
    hud: { leaderboard: ["Runner A", "Runner B"] },
    highlights: [{ id: "h1", desc: "Overtake" }],
    recap: { summary: "Great race so far." }
  });
  console.log("broadcastEngine ✅ wrote valid tick");
} catch (err) {
  console.error("broadcastEngine ❌", err.message);
}

try {
  // Missing required field -> should throw
  broadcastEngine.process({
    ts: Date.now(),
    hud: {},
    highlights: [],
    recap: {}
  });
} catch (err) {
  console.log("broadcastEngine schema fail ✅", err.message);
}
