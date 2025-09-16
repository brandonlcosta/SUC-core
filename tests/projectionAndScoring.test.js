import { createProjectionEvent } from "../backend/engines/projectionEngine.js";
import { updateScoring, getLeaderboard, resetScoring } from "../backend/engines/scoringEngine.js";

function runTests() {
  resetScoring();

  const truthLap = {
    event_type: "lap_completed",
    runner_id: "r123",
    timestamp: new Date().toISOString(),
    location: { checkpoint_id: "start_finish" },
    source: { system: "timing_mat", device_id: "mat_01", method: "RFID_read" },
    quality: { confidence: 1.0, priority: 1.0, trust_level: "truth" },
    meta: {}
  };

  updateScoring(truthLap);

  const proj = createProjectionEvent({
    runner_id: "r123",
    lat: 39.12,
    lon: -120.56,
    sector_name: "Far Trail"
  });

  updateScoring(proj);

  const leaderboard = getLeaderboard();
  console.log("🏁 Leaderboard after truth + projection:", leaderboard);
}

runTests();
