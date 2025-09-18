// File: tests/demoMapEvents.js
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("./outputs/broadcast/demo");
const LATEST = path.join(OUT_DIR, "latest.json");
fs.mkdirSync(OUT_DIR, { recursive: true });

function writeTick(tick) {
  const payload = { ts: Date.now(), ...tick };
  fs.writeFileSync(LATEST, JSON.stringify(payload, null, 2));
  console.log("📝 Demo tick written:", payload.overlay_type);
}

function positionsTick() {
  writeTick({
    overlay_type: "positions_update",
    positions: [
      { id: "r1", name: "Runner 1", coords: [-122.4194, 37.7749] },
      { id: "r2", name: "Runner 2", coords: [-122.4094, 37.7799] }
    ],
    ticker: "Positions updated"
  });
}

function zonesTick() {
  writeTick({
    overlay_type: "zones_update",
    zones: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { owner: "Blue" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-122.43, 37.77], [-122.41, 37.77],
              [-122.41, 37.79], [-122.43, 37.79],
              [-122.43, 37.77]
            ]]
          }
        }
      ]
    },
    ticker: "Zones updated"
  });
}

function routeTick() {
  writeTick({
    overlay_type: "route_update",
    route: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [-122.431297, 37.773972],
              [-122.4194, 37.7749],
              [-122.4094, 37.7799]
            ]
          },
          properties: { name: "Live Route" }
        }
      ]
    },
    ticker: "Route updated"
  });
}

positionsTick();
setTimeout(zonesTick, 1500);
setTimeout(routeTick, 3000);
