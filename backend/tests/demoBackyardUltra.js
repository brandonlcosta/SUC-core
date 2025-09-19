// File: backend/tests/demoBackyardUltra.js

import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "../outputs/broadcast");

// helper to write JSON file
function writeJSON(file, data) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, file), JSON.stringify(data, null, 2));
  console.log(`Wrote ${file}`);
}

// demo roster.json
function makeRoster() {
  return {
    athletes: [
      { athlete_id: "runner_brandon", crew: "SUC", laps: 3, status: "active" },
      { athlete_id: "runner_emily", crew: "Trail Blazers", laps: 2, status: "active" }
    ]
  };
}

// demo spatial.json (GeoJSON)
function makeSpatial() {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.4, 37.8] },
        properties: { athlete_id: "runner_brandon", crew: "SUC" }
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.41, 37.81] },
        properties: { athlete_id: "runner_emily", crew: "Trail Blazers" }
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.42, 37.82] },
        properties: { checkpoint_id: "cp1", name: "Checkpoint 1" }
      }
    ]
  };
}

// demo overlays.json
function makeOverlays() {
  return [
    { event_id: "evt_1", overlay_type: "ticker", message: "Race Started!" },
    { event_id: "evt_2", overlay_type: "sponsor_card", sponsor_slot: "Nike" }
  ];
}

// loop writer
function loop() {
  writeJSON("roster.json", makeRoster());
  writeJSON("spatial.json", makeSpatial());
  writeJSON("overlays.json", makeOverlays());
}

loop();
setInterval(loop, 5000);
