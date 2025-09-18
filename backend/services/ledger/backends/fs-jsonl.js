// File: backend/services/ledger/backends/fs-jsonl.js
// Append-only FS ledger with daily rotation + retention cleanup + in-memory tail cache.

import fs from "fs";
import fsp from "fs/promises";
import path from "path";

function ymdKey(d = new Date()) {
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("");
}

function makePaths(baseDir, key) {
  return {
    ticks: path.join(baseDir, `ticks-${key}.jsonl`),
    engine_events: path.join(baseDir, `events-${key}.jsonl`),
    operator_actions: path.join(baseDir, `ops-${key}.jsonl`),
  };
}

function cutoffKey(retentionDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - retentionDays);
  return ymdKey(d);
}

async function readLastLines(file, n) {
  if (!fs.existsSync(file)) return [];
  const data = await fsp.readFile(file, "utf-8");
  return data.split("\n").filter(Boolean).slice(-n);
}

export async function createFsJsonlBackend(cfg) {
  const baseDir = cfg.dir;
  fs.mkdirSync(baseDir, { recursive: true });

  let currentKey = ymdKey();
  let paths = makePaths(baseDir, currentKey);
  let lastCleanup = 0;

  const tailCap = cfg.tail_size ?? 500;
  const tickTail = [];

  try {
    const tailLines = await readLastLines(paths.ticks, Math.min(tailCap, 500));
    for (const line of tailLines) {
      const obj = JSON.parse(line);
      tickTail.push(obj);
    }
  } catch {
    // ignore errors on init
  }

  function rotateIfNeeded() {
    const key = ymdKey();
    if (key !== currentKey) {
      currentKey = key;
      paths = makePaths(baseDir, currentKey);
    }
  }

  async function cleanupIfNeeded() {
    const now = Date.now();
    if (now - lastCleanup < 60 * 60 * 1000) return;
    lastCleanup = now;

    const cutoff = cutoffKey(cfg.retention_days ?? 14);
    const files = await fsp.readdir(baseDir);
    for (const f of files) {
      if (f.match(/(ticks|events|ops)-(\d+)\.jsonl/)) {
        const [, , date] = f.match(/(ticks|events|ops)-(\d+)\.jsonl/);
        if (date < cutoff) {
          await fsp.unlink(path.join(baseDir, f));
        }
      }
    }
  }

  return {
    async event(e) {
      rotateIfNeeded();
      cleanupIfNeeded();
      await fsp.appendFile(paths.engine_events, JSON.stringify(e) + "\n");
    },
    async tick(t) {
      rotateIfNeeded();
      cleanupIfNeeded();
      await fsp.appendFile(paths.ticks, JSON.stringify(t) + "\n");
      tickTail.push(t);
      if (tickTail.length > tailCap) tickTail.shift();
    },
    async operator(op) {
      rotateIfNeeded();
      cleanupIfNeeded();
      await fsp.appendFile(paths.operator_actions, JSON.stringify(op) + "\n");
    },
    async lastTicks(n = 10) {
      return tickTail.slice(-n);
    },
    async close() {
      // no-op for fs backend
    },
  };
}

// Wrapper class for default export
export class FsJsonlBackend {
  async create(cfg) {
    return await createFsJsonlBackend(cfg);
  }
}

// Default singleton instance (lazy, not auto-created)
const fsJsonlBackend = new FsJsonlBackend();
export default fsJsonlBackend;
