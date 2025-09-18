// File: backend/runtime/tickRuntime.js
// Safe, dependency-light tick runtime. Starts Operator API if present and emits ticks every interval.
import fs from "fs";
import path from "path";
import { emitTick } from "../engines/tickEngine.js";
import { initLedger } from "../services/ledger/index.js";

// ---- helpers ----
function safeJSON(p, fallback) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; } }
function safeText(p, fallback = "") { try { return fs.readFileSync(p, "utf8"); } catch { return fallback; } }
function loadCfg() {
  try { return JSON.parse(fs.readFileSync(path.resolve("./backend/configs/engineDefaults.json"), "utf8")); } catch {}
  try { return JSON.parse(fs.readFileSync(path.resolve("./configs/engineDefaults.json"), "utf8")); } catch {}
  return {
    tick_interval_ms: 1000,
    operator_api_port: 3100,
    paths: { outputs_dir: "./outputs" },
    ledger: { backend: "auto", dir: "./backend/outputs/ledger", retention_days: 14, tail_size: 500 }
  };
}
async function maybeStartOperatorApi(port) {
  try {
    const mod = await import("../server/operatorApi.js");
    await mod.startOperatorApi(port);
    return true;
  } catch {
    console.warn("ℹ️ Operator API not started (file missing is OK for dev).");
    return false;
  }
}

// ---- paths used by the runtime (keep in ./outputs/broadcast/*) ----
const HUD_PATH = path.resolve("./outputs/broadcast/hud.json");
const TICKER_PATH = path.resolve("./outputs/broadcast/ticker.txt");
const HIGHLIGHTS_PATH = path.resolve("./outputs/broadcast/highlights.json");
const RECAP_PATH = path.resolve("./outputs/broadcast/recap.json");
const OUT_STATE = path.resolve("./outputs/broadcast/state.json");
const STATE_DEFAULTS_CANDIDATES = [
  path.resolve("./backend/configs/stateDefaults.json"),
  path.resolve("./configs/stateDefaults.json")
];

// ---- main ----
export async function startTickRuntime({ intervalMs, operatorApiPort } = {}) {
  const cfg = loadCfg();
  const interval = intervalMs ?? cfg.tick_interval_ms ?? 1000;
  const opPort = operatorApiPort ?? cfg.operator_api_port ?? 3100;

  // ledger (fs-jsonl by default; sqlite if available)
  await initLedger(cfg.ledger ?? {});

  // ensure outputs dir
  fs.mkdirSync(path.dirname(HUD_PATH), { recursive: true });

  // seed initial state on first boot
  const stateDefaultsPath = STATE_DEFAULTS_CANDIDATES.find((p) => fs.existsSync(p));
  if (!fs.existsSync(OUT_STATE) && stateDefaultsPath) {
    try {
      const bootState = JSON.parse(fs.readFileSync(stateDefaultsPath, "utf8"));
      fs.writeFileSync(OUT_STATE, JSON.stringify(bootState, null, 2));
      console.log("📝 Wrote initial state → outputs/broadcast/state.json");
    } catch (e) {
      console.warn("⚠️ Could not seed initial state:", e.message);
    }
  }

  // optional operator API
  await maybeStartOperatorApi(opPort);

  // emit ticks on a fixed loop
  const timer = setInterval(() => {
    const partials = {
      ticker: safeText(TICKER_PATH, ""),
      hud: safeJSON(HUD_PATH, {}),
      highlights: safeJSON(HIGHLIGHTS_PATH, []),
      recap: safeJSON(RECAP_PATH, {})
    };
    emitTick(partials);
  }, interval);

  console.log(`⏱️  Tick runtime running @ ${interval}ms`);
  return () => clearInterval(timer);
}

export default { startTickRuntime };
