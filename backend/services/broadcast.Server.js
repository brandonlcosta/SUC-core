// /backend/services/broadcastServer.js
// WebSocket server that streams pipeline outputs to frontend

import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import runPipeline from "./pipelineService.js";
import { runIngestService } from "./ingestService.js";

const PORT = process.env.BROADCAST_PORT || 8080;

const server = http.createServer();
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws) => {
  console.log("📡 Client connected");
  clients.push(ws);

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clients = clients.filter((c) => c !== ws);
  });
});

async function broadcastLoop() {
  try {
    // Ingest raw events from adapters
    const rawEvents = await runIngestService();

    // Run full pipeline
    const outputs = await runPipeline(rawEvents);

    // Push to all clients
    const payload = JSON.stringify(outputs);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });

    console.log(`✅ Broadcast tick sent to ${clients.length} clients`);
  } catch (err) {
    console.error("❌ Broadcast loop error", err);
  }

  setTimeout(broadcastLoop, 5000); // run every 5s
}

server.listen(PORT, () => {
  console.log(`🚀 BroadcastServer running on ws://localhost:${PORT}`);
  broadcastLoop();
});
