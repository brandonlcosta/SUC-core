// File: backend/server/demoServer.js
import { WebSocketServer } from "ws";

const DEFAULT_PORT = 3201;

function startServer(port) {
  try {
    const wss = new WebSocketServer({ port });
    console.log(`✅ Demo server running on ws://localhost:${port}`);

    // Example connection log
    wss.on("connection", (ws) => {
      console.log("🔌 New client connected.");
      ws.on("close", () => console.log("❌ Client disconnected."));
    });

    return wss;
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      return startServer(port + 1);
    } else {
      throw err;
    }
  }
}

startServer(DEFAULT_PORT);
