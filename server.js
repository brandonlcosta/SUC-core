// server.js
// Minimal Hype OS runtime (no external deps)

import http from "http";
import url from "url";
import fs from "fs";
import { IngestService } from "./services/ingestService.js";
import { generateAdapter } from "./adapterFactory/codegen.js";
import { HypeGraph } from "./graph/hypeGraph.js";
import { makeTicker, makeLeaderboard, makeStory } from "./studio/panels.js";

const graph = new HypeGraph();
const ingest = new IngestService({ graph });

function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let buf = "";
    req.on("data", (c) => (buf += c));
    req.on("end", () => resolve(buf ? JSON.parse(buf) : {}));
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);

  if (req.method === "GET" && pathname === "/metrics") {
    return json(res, 200, ingest.slo());
  }

  if (req.method === "GET" && pathname === "/studio") {
    const ticker = makeTicker(graph);
    const leaderboard = makeLeaderboard(graph);
    const story = makeStory(graph);
    return json(res, 200, { brand: "Hype OS", panels: { ticker, leaderboard, story } });
  }

  if (req.method === "POST" && pathname === "/ingest") {
    const body = await readBody(req);
    const adapter = generateAdapter(body.mapping);
    const result = await ingest.ingest({
      fetchEvents: () => adapter.fetchEvents(body.sample || [])
    });
    return json(res, 200, { ok: true, result });
  }

  if (req.method === "POST" && pathname === "/highlight") {
    const body = await readBody(req);
    const id = graph.writeHighlight(body);
    return json(res, 200, { ok: true, id });
  }

  if (req.method === "GET" && pathname === "/sponsor-slots") {
    try {
      const slots = JSON.parse(fs.readFileSync("configs/sponsorSlots.json"));
      return json(res, 200, { brand: "Hype OS", slots });
    } catch {
      return json(res, 200, { brand: "Hype OS", slots: [] });
    }
  }

  json(res, 404, { error: "Not found" });
});

if (process.env.RUN_SERVER === "1") {
  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`⚡ Hype OS listening on :${port}`);
  });
}

export default server;
