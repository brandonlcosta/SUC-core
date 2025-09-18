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
    CREATE INDEX IF NOT EXISTS idx_operator_actions_ts ON operator_actions(ts);
  `);

  return {
    async event(e) {
      db.prepare(
        `INSERT INTO engine_events (ts, engine, event_type, payload_json) VALUES (?, ?, ?, ?)`
      ).run(Date.now(), e.engine || "unknown", e.type || "generic", JSON.stringify(e));
    },
    async tick(t) {
      db.prepare(`INSERT INTO ticks (ts, payload_json) VALUES (?, ?)`).run(
        Date.now(),
        JSON.stringify(t)
      );
    },
    async operator(op) {
      db.prepare(
        `INSERT INTO operator_actions (ts, action_type, payload_json) VALUES (?, ?, ?)`
      ).run(Date.now(), op.type || "generic", JSON.stringify(op));
    },
    async lastTicks(n = 10) {
      return db
        .prepare(`SELECT payload_json FROM ticks ORDER BY ts DESC LIMIT ?`)
        .all(n)
        .map((row) => JSON.parse(row.payload_json));
    },
    async close() {
      db.close();
    },
  };
}

// Wrapper class for default export
export class SqliteBackend {
  async create(cfg) {
    return await createSqliteBackend(cfg);
  }
}

// Default singleton instance (lazy, not auto-created)
const sqliteBackend = new SqliteBackend();
export default sqliteBackend;
