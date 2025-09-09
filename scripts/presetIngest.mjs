// scripts/presetIngest.mjs
// Usage: node scripts/presetIngest.mjs csv|rfid|strava
import fs from "fs";
import path from "path";
import http from "http";

const preset = process.argv[2] || "csv";
const root = process.cwd();
const mpath = path.join(root, "adapterFactory", "presets", `${preset}.mapping.json`);
const spath = path.join(root, "adapterFactory", "presets", "samples", `${preset}.sample.json`);

if (!fs.existsSync(mpath) || !fs.existsSync(spath)) {
  console.error(`Preset ${preset} not found. Ensure mapping & sample exist.`);
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mpath, "utf8"));
const sample = JSON.parse(fs.readFileSync(spath, "utf8"));

function post(pathname, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body));
    const req = http.request(
      { method: "POST", host: "127.0.0.1", port: process.env.PORT || 8080, path: pathname, headers: { "Content-Type": "application/json", "Content-Length": data.length } },
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

(async () => {
  console.log(`Ingesting preset: ${preset}`);
  const r = await post("/ingest", { mapping, sample });
  console.log("Ingest result:", r);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
