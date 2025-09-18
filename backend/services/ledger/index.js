// File: backend/services/ledger/index.js
// Unified Ledger facade: auto-selects backend (sqlite if available, else fs-jsonl).

import fs from "fs";
import path from "path";

let backend = null;

function normalizeConfig(partial = {}) {
  return {
    backend: partial.backend ?? "auto", // "auto" | "sqlite" | "fs"
    dir: path.resolve(partial.dir ?? "./backend/outputs/ledger"),
    retention_days: Number.isFinite(partial.retention_days)
      ? partial.retention_days
      : 14,
    tail_size: Number.isFinite(partial.tail_size) ? partial.tail_size : 500,
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
        console.warn(
          "⚠️ Requested sqlite backend but failed to init. Falling back to FS. Reason:",
          e?.message || e
        );
      } else {
        console.warn("ℹ️ SQLite not available, using FS backend.");
      }
    }
  }

  const { createFsBackend } = await import("./backends/fs-jsonl.js");
  backend = await createFsBackend(cfg);
  console.log("🧱 Ledger backend: FS JSONL");
  return backend;
}

export function ledgerEvent(event) {
  return backend?.event?.(event);
}

export function ledgerTick(tick) {
  return backend?.tick?.(tick);
}

export function ledgerOperatorAction(action) {
  return backend?.operator?.(action);
}

export function lastNTicks(n = 10) {
  return backend?.lastTicks?.(n);
}

export function closeLedger() {
  return backend?.close?.();
}

// Wrapper class for default export
export class Ledger {
  async init(cfg) {
    return await initLedger(cfg);
  }
  event(evt) {
    return ledgerEvent(evt);
  }
  tick(t) {
    return ledgerTick(t);
  }
  operator(action) {
    return ledgerOperatorAction(action);
  }
  last(n) {
    return lastNTicks(n);
  }
  close() {
    return closeLedger();
  }
}

// Default singleton instance
const ledger = new Ledger();
export default ledger;
