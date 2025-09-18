// File: tests/demoMultiSession.js
import { runBackyardUltra } from "../backend/tests/demoBackyardUltra.js";
import { runTurfWars } from "./demoTurfWars.js";
import { runMarathon } from "./demoMarathon.js";

const runners = [
  { athlete_id: "runner_brandon", asset_id: "runner_brandon_v1" },
  { athlete_id: "runner_emily", asset_id: "runner_emily_v1" }
];

// Start all demos in parallel
runBackyardUltra(runners);
runTurfWars(runners);
runMarathon(runners);

console.log("✅ Multi-session demo started: Backyard Ultra + Turf Wars + Marathon");
