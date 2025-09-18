// File: backend/services/ledger/backends/sqlite.js
// SQLite backend (optional). Requires 'better-sqlite3' to be installed.
import path from "path";
import fs from "fs";

export async function createSqliteBackend(cfg) {
  const { default: Database } = await import("better-sqlite3"); // throws if missing
  const DB_DIR = cfg.dir;
  const DB_PATH = path.join(DB_DIR, "suc-ledger.sqlite");
  fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS engine_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      engine TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_engine_events_ts ON engine_events(ts);

    CREATE TABLE IF NOT EXISTS ticks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      payload_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ticks_ts ON ticks(ts);

    CREATE TABLE IF NOT EXISTS operator_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );
  `);

  const insertEvent = db.prepare(`INSERT INTO engine_events (ts, engine, event_type, payload_json) VALUES (@ts,@engine,@event_type,@payload_json)`);
  const insertTick  = db.prepare(`INSERT INTO ticks (ts, payload_json) VALUES (@ts,@payload_json)`);
  const insertOp    = db.prepare(`INSERT INTO operator_actions (ts, action_type, payload_json) VALUES (@ts,@action_type,@payload_json)`);

  const tail = [];
  const tailCap = cfg.tail_size ?? 500;

  return {
    writeEvent({ engine, event_type, payload }) {
      insertEvent.run({ ts: Date.now(), engine, event_type, payload_json: JSON.stringify(payload ?? {}) });
    },
    writeTick(tick) {
      const ts = Date.now();
      insertTick.run({ ts, payload_json: JSON.stringify(tick ?? {}) });
      tail.push({ ts, tick });
      while (tail.length > tailCap) tail.shift();
    },
    writeOperatorAction({ action_type, payload }) {
      insertOp.run({ ts: Date.now(), action_type, payload_json: JSON.stringify(payload ?? {}) });
    },
    lastNTicks(n = 50) {
      if (n <= tail.length) return tail.slice(-n).reverse();
      return db.prepare(`SELECT ts, payload_json FROM ticks ORDER BY ts DESC LIMIT ?`)
        .all(n)
        .map(r => ({ ts: r.ts, tick: JSON.parse(r.payload_json) }));
    },
    close() {}
  };
}
