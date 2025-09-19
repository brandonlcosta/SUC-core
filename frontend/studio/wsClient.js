// File: frontend/studio/wsClient.js

let ws;

export function connectWS(onMessage) {
  if (ws) return;

  ws = new WebSocket("ws://localhost:3001"); // must match demoServer.js port

  ws.onopen = () => {
    console.log("✅ WebSocket connected to backend ticks");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("❌ WS parse error:", err);
    }
  };

  ws.onclose = () => {
    console.warn("⚠️ WebSocket closed. Retrying in 2s...");
    setTimeout(() => connectWS(onMessage), 2000);
  };
}
