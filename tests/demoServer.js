// File: backend/server/demoServer.js

import WebSocket, { WebSocketServer } from "ws";
import net from "net";
import fs from "fs";
import path from "path";

const OUTPUT_PATH = path.resolve("backend/outputs/feeds.json");

// Utility: find a free port starting from preferred
function findFreePort(preferred, cb) {
  const server = net.createServer();
  server.listen(preferred, () => {
    const { port } = server.address();
    server.close(() => cb(port));
  });
  server.on("error", () => {
    findFreePort(preferred + 10, cb);
  });
}

// Utility: start WS feed
function startFeed(preferredPort, generator, label, cb) {
  findFreePort(preferredPort, (port) => {
    const wss = new WebSocketServer({ port });
    console.log(
      `Demo ${label} feed running on ws://localhost:${port} (preferred ${preferredPort})`
    );

    wss.on("connection", () => {
      console.log(`[${label}] Client connected on port ${port}`);
    });

    setInterval(() => {
      const tick = generator();
      const payload = JSON.stringify(tick);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }, 2000);

    cb(port);
  });
}

// Demo tick generators
function marathonTick() {
  return {
    type: "lap_completed",
    athlete_id: "runner_brandon",
    lap: Math.floor(Math.random() * 30),
    timestamp: Date.now(),
    geo_positions: [
      {
        athlete_id: "runner_brandon",
        trail: [
          [-122.431, 37.773],
          [-122.432 + Math.random() * 0.01, 37.774 + Math.random() * 0.01],
        ],
      },
    ],
    events: [{ type: "lap_completed", athlete_id: "runner_brandon", message: "Brandon completes a lap!" }],
  };
}

function backyardTick() {
  return {
    type: "lap_completed",
    athlete_id: "runner_emily",
    lap: Math.floor(Math.random() * 15),
    timestamp: Date.now(),
    geo_positions: [
      {
        athlete_id: "runner_emily",
        trail: [
          [-122.435, 37.771],
          [-122.436 + Math.random() * 0.01, 37.772 + Math.random() * 0.01],
        ],
      },
    ],
    events: [{ type: "lap_completed", athlete_id: "runner_emily", message: "Emily crushes another loop!" }],
  };
}

function turfWarsTick() {
  return {
    overlay_type: "story_arc",
    arc_type: "comeback",
    message: "Team Red is surging back!",
    timestamp: Date.now(),
    priority: 8,
  };
}

// Collect feeds
const feeds = {};

startFeed(8080, marathonTick, "Marathon", (port) => {
  feeds.marathon = `ws://localhost:${port}`;
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(feeds, null, 2));
});
startFeed(8081, backyardTick, "Backyard Ultra", (port) => {
  feeds.backyard = `ws://localhost:${port}`;
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(feeds, null, 2));
});
startFeed(8082, turfWarsTick, "Turf Wars", (port) => {
  feeds.turfwars = `ws://localhost:${port}`;
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(feeds, null, 2));
});
