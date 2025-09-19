// File: backend/tests/demoBackyardUltra.js
//
// Phase 3 Demo Adapter — Backyard Ultra
// ✅ Writes roster.json, spatial.json, overlays.json
// ✅ Outputs to both backend/outputs/ and frontend/public/outputs/
// ✅ Ensures directories exist before writing
// ✅ Simulates laps, spatial positions, overlays

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Output Directories ---
const BACKEND_OUTPUT_DIR = path.resolve(__dirname, "../outputs/broadcast");
const FRONTEND_OUTPUT_DIR = path.resolve(__dirname, "../../frontend/public/outputs/broadcast");

// ensure both dirs exist
fs.mkdirSync(BACKEND_OUTPUT_DIR, { recursive: true });
fs.mkdirSync(FRONTEND_OUTPUT_DIR, { recursive: true });

function writeJSON(file, data) {
  const json = JSON.stringify(data, null, 2);
  // backend copy
  fs.writeFileSync(path.join(BACKEND_OUTPUT_DIR, file), json);
  // frontend copy (so React can fetch it)
  fs.writeFileSync(path.join(FRONTEND_OUTPUT_DIR, file), json);
  console.log(`[Demo] Wrote ${file}`);
}

// --- Demo State ---
const roster = {
  athletes: [
    { athlete_id: "runner_brandon", crew: "SUC", laps: 0, status: "active" },
    { athlete_id: "runner_emily", crew: "Trail Blazers", laps: 0, status: "active" }
  ]
};

let tick = 0;

// --- Demo Generators ---
function getSpatial() {
  return {
    athletes: roster.athletes.map((a, i) => ({
      athlete_id: a.athlete_id,
      x: 20 + i * 40 + tick * 5,
      y: 40 + i * 20 + tick * 3
    })),
    checkpoints: [
      { checkpoint_id: "cp1", x: 50, y: 20, name: "CP1" },
      { checkpoint_id: "cp2", x: 120, y: 50, name: "CP2" }
    ]
  };
}

function getOverlays() {
  return [
    {
      event_id: `evt_${tick}`,
      overlay_type: tick % 2 === 0 ? "leaderboard" : "map",
      athlete_ids: roster.athletes.map(a => a.athlete_id),
      sponsor_slot: null,
      priority: tick % 2 === 0 ? 8 : 5,
      timestamp: Date.now()
    }
  ];
}

// --- Demo Loop ---
function loop() {
  tick++;

  // increment laps every few ticks
  roster.athletes.forEach(a => {
    if (tick % 3 === 0) a.laps++;
  });

  writeJSON("roster.json", roster);
  writeJSON("spatial.json", getSpatial());
  writeJSON("overlays.json", getOverlays());

  setTimeout(loop, 5000); // every 5s
}

console.log("[Demo] Backyard Ultra adapter running…");
loop();
