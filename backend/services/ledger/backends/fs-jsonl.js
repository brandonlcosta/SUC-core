// File: backend/services/ledger/backends/fs-jsonl.js
// Append-only FS ledger with daily rotation + retention cleanup + in-memory tail cache.
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

function ymdKey(d = new Date()) {
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0")
  ].join("");
}

function makePaths(baseDir, key) {
  return {
    ticks: path.join(baseDir, `ticks-${key}.jsonl`),
    engine_events: path.join(baseDir, `events-${key}.jsonl`),
    operator_actions: path.join(baseDir, `ops-${key}.jsonl`)
  };
}

function cutoffKey(retentionDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - retentionDays);
  return ymdKey(d);
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
      if (obj && typeof obj.ts === "number" && obj.tick) tickTail.push({ ts: obj.ts, tick: obj.tick });
    }
  } catch {/* ignore */}

  let queue = Promise.resolve();

  async function rotateIfNeeded() {
    const nowKey = ymdKey();
    if (nowKey !== currentKey) {
      currentKey = nowKey;
      paths = makePaths(baseDir, currentKey);
    }
  }

  async function cleanupIfNeeded() {
    const now = Date.now();
    if (now - lastCleanup < 60_000) return;
    lastCleanup = now;

    const minKey = cutoffKey(cfg.retention_days);
    const entries = await fsp.readdir(baseDir).catch(() => []);
    await Promise.all(entries.map(async (name) => {
      const m = name.match(/^(ticks|events|ops)-(\d{8})\.jsonl$/);
      if (!m) return;
      if (m[2] < minKey) {
        try { await fsp.unlink(path.join(baseDir, name)); } catch {}
      }
    }));
  }

  async function append(filePath, obj) {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.appendFile(filePath, JSON.stringify(obj) + "\n");
  }

  async function write(kind, record) {
    await rotateIfNeeded();
    await cleanupIfNeeded();
    const filePath =
      kind === "ticks" ? paths.ticks :
      kind === "engine_events" ? paths.engine_events : paths.operator_actions;
    await append(filePath, record);
    if (kind === "ticks") {
      tickTail.push({ ts: record.ts, tick: record.tick });
      while (tickTail.length > tailCap) tickTail.shift();
    }
  }

  return {
    async writeEvent({ engine, event_type, payload }) {
      queue = queue.then(() => write("engine_events", { ts: Date.now(), engine, event_type, payload })).catch(() => {});
      return queue;
    },
    async writeTick(tick) {
      queue = queue.then(() => write("ticks", { ts: Date.now(), tick })).catch(() => {});
      return queue;
    },
    async writeOperatorAction({ action_type, payload }) {
      queue = queue.then(() => write("operator_actions", { ts: Date.now(), action_type, payload })).catch(() => {});
      return queue;
    },
    lastNTicks(n = 50) {
      return tickTail.slice(-n).reverse();
    },
    async close() {
      await queue;
    }
  };
}

async function readLastLines(file, maxLines) {
  const lines = [];
  const CHUNK = 64 * 1024;
  const fh = await fsp.open(file, "r");
  try {
    const stat = await fh.stat();
    let pos = stat.size;
    let leftover = "";
    while (pos > 0 && lines.length < maxLines) {
      const toRead = Math.min(CHUNK, pos);
      pos -= toRead;
      const { bytesRead, buffer } = await fh.read(Buffer.alloc(toRead), 0, toRead, pos);
      let chunk = buffer.toString("utf8", 0, bytesRead) + leftover;
      const parts = chunk.split("\n");
      leftover = parts.shift() ?? "";
      while (parts.length && lines.length < maxLines) {
        const line = parts.pop();
        if (line && line.trim()) lines.push(line.trim());
      }
    }
    if (leftover && lines.length < maxLines) lines.push(leftover.trim());
    return lines;
  } finally {
    await fh.close();
  }
}
