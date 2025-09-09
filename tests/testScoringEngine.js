/**
 * testScoringEngine v0.1
 * Purpose: Minimal harness for scoringEngine.
 * Run: node tests/testScoringEngine.js
 */
import { createScoringEngine } from "../engines/scoringEngine.js";

function assert(c, m) { if (!c) { console.error("❌", m); process.exitCode = 1; } else console.log("✅", m); }

const baseTs = 1700000000;

const EVENTS = [
  { event_id: "e1", event_type: "lap_split", athlete_id: "ath_1", timestamp: baseTs + 1, metadata: { lap: 1, laps_completed: 1 } },
  { event_id: "e2", event_type: "lap_split", athlete_id: "ath_2", timestamp: baseTs + 2, metadata: { lap: 1, laps_completed: 1 } },
  { event_id: "e3", event_type: "lap_split", athlete_id: "ath_1", timestamp: baseTs + 3600, metadata: { lap: 2, laps_completed: 2 } },
  { event_id: "e4", event_type: "elimination", athlete_id: "ath_3", timestamp: baseTs + 3601, metadata: { lap: 0 } },
  { event_id: "e5", event_type: "finish", athlete_id: "ath_1", timestamp: baseTs + 86400, metadata: { } }
];

function main() {
  console.log("— Scoring Engine Harness —");
  const scoring = createScoringEngine();
  const res = scoring.update(EVENTS);

  console.log("Leaderboard:", res.leaderboard);
  const top = res.leaderboard[0];
  assert(top.athlete_id === "ath_1" && top.laps === 2, "Top rank is ath_1 with 2 laps");
  const hasAth2 = res.leaderboard.find(r => r.athlete_id === "ath_2");
  assert(hasAth2 && hasAth2.laps === 1, "ath_2 has 1 lap");

  const rs = res.runner_state;
  assert(rs.ath_3?.eliminated === true, "ath_3 marked eliminated");
  assert(rs.ath_1?.finished === true, "ath_1 marked finished");

  console.log("\nAll scoring checks complete.");
}

main();