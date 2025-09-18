
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function firstExisting(relPaths) {
  for (const p of relPaths) {
    const abs = path.resolve(repoRoot, p);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

// Config: prefer backend/configs/, fall back to configs/
const cfgPath = firstExisting([
  "backend/configs/engineDefaults.json",
  "configs/engineDefaults.json"
]);

let cfg = { tick_interval_ms: 1000, operator_api_port: 3100 };
if (cfgPath) {
  try { cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8")); }
  catch { console.warn("⚠️ Failed reading", cfgPath, "using built-in defaults"); }
} else {
  console.warn("ℹ️ No engineDefaults.json found, using defaults.");
}

// Runtime module: prefer backend/runtime/, fall back to runtime/
const runtimePath = firstExisting([
  "backend/runtime/tickRuntime.js",
  "runtime/tickRuntime.js"
]);
if (!runtimePath) {
  console.error("❌ Could not find tickRuntime.js in backend/runtime/ or runtime/");
  process.exit(1);
}

const { startTickRuntime } = await import(pathToFileURL(runtimePath).href);
await startTickRuntime({
  intervalMs: cfg.tick_interval_ms ?? 1000,
  operatorApiPort: cfg.operator_api_port ?? 3100
});

console.log("⏱️  TickRuntime started. Press Ctrl+C to exit.");

process.on("unhandledRejection", (e) => {
  console.error("❌ Unhandled rejection:", e);
  process.exit(1);
});
