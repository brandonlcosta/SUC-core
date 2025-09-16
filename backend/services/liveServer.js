// /backend/services/liveServer.js
// Live broadcast WebSocket server

import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const PORT = 4000;
const DEMO_DIR = path.resolve("outputs/broadcast/demo");
const LATEST_FILE = path.join(DEMO_DIR, "latest.json");
const RECAP_FILE = path.join(DEMO_DIR, "recap.json");

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("📡 Client connected");

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

// File watcher
fs.watch(DEMO_DIR, (event, filename) => {
  if (filename === "latest.json") {
    const tick = JSON.parse(fs.readFileSync(LATEST_FILE, "utf8"));
    broadcast({ type: "tick", data: tick });
  }
  if (filename === "recap.json") {
    const recap = JSON.parse(fs.readFileSync(RECAP_FILE, "utf8"));
    broadcast({ type: "recap", data: recap });
  }
});

function broadcast(msg) {
  const json = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(json);
    }
  });
}

console.log(`🚀 Live server running at ws://localhost:${PORT}`);
