// File: backend/services/ledger/index.js
// Unified Ledger facade: auto-selects backend (sqlite if available, else fs-jsonl).
import fs from "fs";
import path from "path";

let backend = null;

function normalizeConfig(partial = {}) {
  return {
    backend: partial.backend ?? "auto", // "auto" | "sqlite" | "fs"
    dir: path.resolve(partial.dir ?? "./backend/outputs/ledger"),
    retention_days: Number.isFinite(partial.retention_days) ? partial.retention_days : 14,
    tail_size: Number.isFinite(partial.tail_size) ? partial.tail_size : 500
  };
}

export async function initLedger(userCfg = {}) {
  const cfg = normalizeConfig(userCfg);
  fs.mkdirSync(cfg.dir, { recursive: true });

  if (cfg.backend === "sqlite" || cfg.backend === "auto") {
    try {
      const { createSqliteBackend } = await import("./backends/sqlite.js");
      backend = await createSqliteBackend(cfg);
      console.log("🧱 Ledger backend: SQLite");
      return backend;
    } catch (e) {
      if (cfg.backend === "sqlite") {
        console.warn("⚠️ Requested sqlite backend but failed to init. Falling back to FS. Reason:", e?.message || e);
      } else {
        console.warn("ℹ️ SQLite not available, using FS JSONL. Reason:", e?.message || e);
      }
    }
  }

  const { createFsJsonlBackend } = await import("./backends/fs-jsonl.js");
  backend = await createFsJsonlBackend(cfg);
  console.log("📄 Ledger backend: FS JSONL");
  return backend;
}

function ensureInit() {
  if (!backend) throw new Error("Ledger not initialized. Call initLedger() at runtime boot.");
}

export function ledgerEvent({ engine, event_type, payload }) {
  ensureInit();
  return backend.writeEvent({ engine, event_type, payload });
}

export function ledgerTick(tick) {
  ensureInit();
  return backend.writeTick(tick);
}

export function ledgerOperatorAction({ action_type, payload }) {
  ensureInit();
  return backend.writeOperatorAction({ action_type, payload });
}

export function lastNTicks(n = 50) {
  ensureInit();
  return backend.lastNTicks(n);
}

export async function closeLedger() {
  if (backend?.close) await backend.close();
}

export default {
  initLedger,
  ledgerEvent,
  ledgerTick,
  ledgerOperatorAction,
  lastNTicks,
  closeLedger
};
