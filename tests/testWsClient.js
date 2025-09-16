// tests/testWsClient.js
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => console.log("✅ Connected to WS server"));
ws.on("message", (data) => console.log("📩 Message:", data.toString()));
