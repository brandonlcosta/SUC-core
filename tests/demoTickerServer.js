// File: tests/demoTickerServer.js

import WebSocket, { WebSocketServer } from "ws";
import { BroadcastTickService } from "../backend/services/broadcastTick.js";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
const tickService = new BroadcastTickService();

// Example routes
const marathonRoute = [
  { coords: [-122.4194, 37.7749], km: 0 },
  { coords: [-122.4180, 37.7790], km: 5 },
  { coords: [-122.4120, 37.7900], km: 10 },
  { coords: [-122.4050, 37.8000], km: 21 },
  { coords: [-122.4000, 37.8100], km: 42 },
];

let index = 0;

// Broadcast helper
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("✅ Client connected to broadcast server");
  ws.send(JSON.stringify({ message: "Connected to SUC-core demo feed" }));
});

function emitNextTick() {
  if (index >= marathonRoute.length) {
    console.log("🏁 Marathon demo finished!");
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
  console.log("Broadcast Tick:", payload);

  // Send over WebSocket
  broadcast(payload);

  index++;
}

// Run tick loop every 2s
const loop = setInterval(emitNextTick, 2000);

console.log(`🚀 SUC-core demo WebSocket server running on ws://localhost:${PORT}`);
