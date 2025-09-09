// tests/hype.runtime.smoke.mjs
// Quick end-to-end smoke: run server, ingest two events, verify panels & metrics.
// Run: node tests/hype.runtime.smoke.mjs

import http from "http";
import server from "../server.js";

const PORT = process.env.PORT || 8080;
process.env.RUN_SERVER = "1";
server.listen?.(PORT);

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body));
    const req = http.request(
      { method: "POST", host: "127.0.0.1", port: PORT, path, headers: { "Content-Type": "application/json", "Content-Length": data.length } },
      (res) => {
        let buf = ""; res.on("data", (c) => (buf += c)); res.on("end", () => resolve(JSON.parse(buf)));
      }
    );
    req.on("error", reject); req.write(data); req.end();
  });
}
function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: PORT, path }, (res) => {
      let buf = ""; res.on("data", (c) => (buf += c)); res.on("end", () => resolve(JSON.parse(buf)));
    }).on("error", reject);
  });
}

const mapping = {
  name: "csv-demo",
  source: "csv",
  mappings: {
    id:        { path: "id", fn: "string" },
    ts:        { path: "time", fn: "dateIso" },
    type:      { path: "kind", fn: "string" },
    athleteId: { path: "athlete", fn: "string" },
    score:     { path: "score", fn: "number" },
    payload:   { path: "payload" }
  }
};
const sample = [
  { id: "e1", time: Date.now(), kind: "checkpoint", athlete: "A42", score: 5, payload: { split: 420 } },
  { id: "e2", time: Date.now(), kind: "sprint",     athlete: "A17", score: 9, payload: { watts: 900 } }
];

(async () => {
  const r = await post("/ingest", { mapping, sample });
  if (!r.ok) throw new Error("ingest failed");
  await post("/highlight", { id: "h1", title: "Photo Finish!", lineage: ["e2"] });

  const studio = await get("/studio");
  const metrics = await get("/metrics");
  console.log({ ticker: studio.panels.ticker.length, leaderboard: studio.panels.leaderboard.length, story: studio.panels.story.length, metrics });

  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
