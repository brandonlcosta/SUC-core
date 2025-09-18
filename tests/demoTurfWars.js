// File: tests/demoTurfWars.js
import fs from "fs";
import path from "path";

const OUTPUT = path.resolve("backend/outputs/broadcast/broadcastTicks.jsonl");

function emitCapture(runners) {
  const tick = {
    event_id: `turfwars_${Date.now()}`,
    session_id: "turfwars_day1",
    overlay_type: "zone_capture",
    athlete_ids: runners.map(r => r.athlete_id),
    asset_ids: runners.map(r => r.asset_id),
    environment_id: "turf_arena_v1",
    sponsor_slot: "redbull_banner",
    priority: 7,
    timestamp: Date.now()
  };
  fs.appendFileSync(OUTPUT, JSON.stringify(tick) + "\n");
  console.log("Turf Wars tick:", tick);
}

export function runTurfWars(runners) {
  setInterval(() => {
    emitCapture(runners);
  }, 6000);
}
