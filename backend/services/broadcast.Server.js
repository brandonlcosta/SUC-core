// File: backend/services/broadcast.Server.js
// WebSocket broadcast server that streams pipeline outputs to frontend

import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import pipelineService, { runPipeline } from "./pipelineService.js";
import ingestService, { runIngestService } from "./ingestService.js";

const PORT = process.env.BROADCAST_PORT || 8080;

export class BroadcastServer {
  constructor() {
    this.server = http.createServer();
    this.wss = new WebSocketServer({ server: this.server });
    this.clients = [];
    this.isRunning = false;

    this.wss.on("connection", (ws) => {
      console.log("📡 Client connected");
      this.clients.push(ws);

      ws.on("close", () => {
        console.log("❌ Client disconnected");
        this.clients = this.clients.filter((c) => c !== ws);
      });
    });
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.server.listen(PORT, () => {
      console.log(`🚀 Broadcast server listening on port ${PORT}`);
    });

    this.loop();
  }

  async loop() {
    while (this.isRunning) {
      try {
        // Ingest raw events
        const rawEvents = await runIngestService();

        // Run broadcast pipeline
        const outputs = await runPipeline(rawEvents);

        // Serialize payload
        const payload = JSON.stringify(outputs);

        // Broadcast to connected clients
        this.clients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
          }
        });
      } catch (err) {
        console.error("⚠️ Broadcast loop error:", err);
      }

      // Control tick pacing
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  stop() {
    this.isRunning = false;
    this.wss.close();
    this.server.close();
    console.log("🛑 Broadcast server stopped");
  }
}

// Default singleton instance
const broadcastServer = new BroadcastServer();
export default broadcastServer;
