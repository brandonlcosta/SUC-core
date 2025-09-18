// File: backend/services/liveServer.js
// Live broadcast WebSocket server

import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const PORT = process.env.LIVE_PORT || 4000;
const DEMO_DIR = path.resolve("outputs/broadcast/demo");
const LATEST_FILE = path.join(DEMO_DIR, "latest.json");
const RECAP_FILE = path.join(DEMO_DIR, "recap.json");

export class LiveServer {
  constructor() {
    this.wss = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.wss = new WebSocketServer({ port: PORT });

    this.wss.on("connection", (ws) => {
      console.log("📡 Live client connected");

      // Send last known tick
      if (fs.existsSync(LATEST_FILE)) {
        const tick = JSON.parse(fs.readFileSync(LATEST_FILE, "utf8"));
        ws.send(JSON.stringify({ type: "tick", data: tick }));
      }

      // Send recap if exists
      if (fs.existsSync(RECAP_FILE)) {
        const recap = JSON.parse(fs.readFileSync(RECAP_FILE, "utf8"));
        ws.send(JSON.stringify({ type: "recap", data: recap }));
      }
    });

    // Watch demo directory for file changes
    fs.watch(DEMO_DIR, (event, filename) => {
      if (filename === "latest.json" && fs.existsSync(LATEST_FILE)) {
        const tick = JSON.parse(fs.readFileSync(LATEST_FILE, "utf8"));
        this.broadcast({ type: "tick", data: tick });
      }
      if (filename === "recap.json" && fs.existsSync(RECAP_FILE)) {
        const recap = JSON.parse(fs.readFileSync(RECAP_FILE, "utf8"));
        this.broadcast({ type: "recap", data: recap });
      }
    });

    console.log(`🚀 LiveServer running on ws://localhost:${PORT}`);
  }

  broadcast(msg) {
    if (!this.wss) return;
    const payload = JSON.stringify(msg);
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });
  }

  stop() {
    if (!this.wss) return;
    this.wss.close();
    this.isRunning = false;
    console.log("🛑 LiveServer stopped");
  }
}

// Named helpers
export function startLiveServer() {
  return liveServer.start();
}
export function stopLiveServer() {
  return liveServer.stop();
}
export function broadcastLive(msg) {
  return liveServer.broadcast(msg);
}

// Default singleton instance
const liveServer = new LiveServer();
export default liveServer;
