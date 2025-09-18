// File: backend/server/loadCfg.js
// Looks for engineDefaults.json in backend/configs/ OR configs/, with safe fallbacks.
import fs from "fs";
import path from "path";

export function loadCfg() {
  const candidates = [
    path.resolve("./backend/configs/engineDefaults.json"),
    path.resolve("./configs/engineDefaults.json")
  ];
  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, "utf8");
      const cfg = JSON.parse(raw);
      return cfg;
    } catch {}
  }
  // safe defaults
  return {
    tick_interval_ms: 1000,
    operator_api_port: 3100,
    dev_server_port: 3200,
    ws_tick_port: 3201,
    paths: {
      outputs_dir: "./outputs",
      demo_tick: "./outputs/broadcast/demo/latest.json"
    },
    ledger: {
      backend: "auto",
      dir: "./backend/outputs/ledger",
      retention_days: 14,
      tail_size: 500
    }
  };
}
