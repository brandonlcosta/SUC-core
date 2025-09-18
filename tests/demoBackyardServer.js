// File: tests/demoBackyardServer.js

import WebSocket, { WebSocketServer } from "ws";
import { BroadcastTickService } from "../backend/services/broadcastTick.js";

const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });
const tickService = new BroadcastTickService();

// Simple 400m loop (square-ish path)
const loop = [
  [-122.4194, 37.7749],
  [-122.4185, 37.7755],
  [-122.4190, 37.7760],
  [-122.4194, 37.7749], // back to start
];

let lap = 1;
let index = 0;

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("✅ Client connected to Backyard Ultra feed");
  ws.send(JSON.stringify({ message: "Connected to Backyard Ultra demo feed" }));
  // Set broadcast mode when a client joins
  tickService.metaEngine.setMode("backyardUltra");
});

function emitNextTick() {
  const coords = loop[index];
  const tick = {
    athlete_id: lap % 2 === 0 ? "runner_emily" : "runner_brandon",
    coordinates: coords,
    lap,
    distance_km: null,
    rank: lap % 2 === 0 ? 2 : 1,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const payload = tickService.processTick(tick);
  console.log(`Backyard Tick (Lap ${lap}):`, payload);

  // Send over WebSocket
  broadcast(payload);

  index++;
  if (index >= loop.length) {
    index = 0;
    lap++;
    if (lap > 6) {
      console.log("🏁 Backyard Ultra demo finished!");
      clearInterval(loopTimer);
    }
  }
}

// Emit one tick per second
const loopTimer = setInterval(emitNextTick, 1000);

console.log(`🚀 SUC-core Backyard Ultra WebSocket server running on ws://localhost:${PORT}`);
