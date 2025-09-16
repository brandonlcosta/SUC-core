import scoringEngine from "../backend/engines/scoringEngine.js";

try {
  scoringEngine.process([
    { id: "r1", name: "Runner A", score: 100 },
    { id: "r2", name: "Runner B", score: 90 }
  ]);
  console.log("scoringEngine ✅ wrote leaderboard tick");
} catch (err) {
  console.error("scoringEngine ❌", err.message);
}

try {
  // Missing score → should fail
  scoringEngine.process([{ id: "r1", name: "Runner A" }]);
} catch (err) {
  console.log("scoringEngine schema fail ✅", err.message);
}
