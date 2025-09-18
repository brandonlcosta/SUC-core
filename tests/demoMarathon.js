// File: tests/demoMarathon.js

import { BroadcastTickService } from "../backend/services/broadcastTick.js";

const tickService = new BroadcastTickService();

// Simplified SF Marathon checkpoints
const marathonRoute = [
  { coords: [-122.4194, 37.7749], km: 0 },
  { coords: [-122.4180, 37.7790], km: 5 },
  { coords: [-122.4120, 37.7900], km: 10 },
  { coords: [-122.4050, 37.8000], km: 21 },
  { coords: [-122.4000, 37.8100], km: 42 },
];

let index = 0;

function emitNextTick() {
  if (index >= marathonRoute.length) {
    console.log("✅ Marathon demo finished!");
    clearInterval(loop);
    return;
  }

  const point = marathonRoute[index];
  const tick = {
    athlete_id: "runner_brandon",
    coordinates: point.coords,
    lap: 1,
    distance_km: point.km,
    rank: 1,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const payload = tickService.processTick(tick);
  console.log("Marathon Tick:", payload);

  index++;
}

// Emit one tick every 2 seconds (for demo pacing)
const loop = setInterval(emitNextTick, 2000);
