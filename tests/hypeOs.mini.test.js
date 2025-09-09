// tests/hypeOs.mini.test.js
// Minimal runnable demo: node tests/hypeOs.mini.test.js

import server from "../server.js";
import http from "http";
import assert from "assert";

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body));
    const req = http.request(
      { method: "POST", path, port: process.env.PORT || 8080, host: "127.0.0.1", headers: { "Content-Type": "application/json", "Content-Length": data.length } },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve(JSON.parse(buf)));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get({ path, port: process.env.PORT || 8080, host: "127.0.0.1" }, (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve(JSON.parse(buf)));
      })
      .on("error", reject);
  });
}

async function main() {
  process.env.RUN_SERVER = "1";
  const port = process.env.PORT || 8080;
  server.listen?.(port);

  const mapping = {
    name: "csv-demo",
    source: "csv",
    transform: { defaults: {} },
    mappings: {
      id: { path: "id", fn: "string" },
      ts: { path: "time", fn: "dateIso" },
      type: { path: "kind", fn: "string" },
      athleteId: { path: "athlete", fn: "string" },
      score: { path: "score", fn: "number" },
      payload: { path: "payload" }
    }
  };

  const sample = [
    { id: "e1", time: Date.now(), kind: "checkpoint", athlete: "A42", score: 5, payload: { split: 420 } },
    { id: "e2", time: Date.now(), kind: "sprint", athlete: "A17", score: 9, payload: { watts: 900 } }
  ];

  const r = await post("/ingest", { mapping, sample });
  assert.ok(r.ok, "ingest ok");

  const hl = await post("/highlight", { id: "h1", title: "Photo Finish!", lineage: ["e2"] });
  assert.ok(hl.ok, "highlight ok");

  const studio = await get("/studio");
  assert.equal(studio.brand, "Hype OS");
  assert.ok(studio.panels?.ticker?.length > 0, "ticker present");
  assert.ok(studio.panels?.leaderboard?.length > 0, "leaderboard present");
  assert.ok(studio.panels?.story?.length > 0, "story present");

  const metrics = await get("/metrics");
  assert.equal(metrics.brand, "Hype OS");
  assert.ok("schemaErrorRate" in metrics, "metrics present");

  console.log("✅ Hype OS mini run succeeded");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
