// backend/demoServer.js
import http from "http";
import fs from "fs";
import path from "path";

const DEMO_DIR = path.resolve("./outputs/broadcast/demo");

// ✅ ensure folder exists so server never ENOENTs
fs.mkdirSync(DEMO_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/broadcast/demo/latest") {
    try {
      const latestPath = path.join(DEMO_DIR, "latest.json");

      if (!fs.existsSync(latestPath)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "waiting" }));
      }

      const data = fs.readFileSync(latestPath, "utf-8");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
      return;
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

if (process.env.RUN_DEMO === "1") {
  const port = process.env.DEMO_PORT || 3000;
  server.listen(port, () => {
    console.log(`🎬 Demo server running on :${port}`);
  });
}

export default server;
