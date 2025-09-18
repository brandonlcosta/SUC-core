// File: backend/services/ledgerService.js

import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve("./backend/outputs/logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Write an event to JSONL log (no SQLite)
 */
export async function event({ engine, type, payload }) {
  const timestamp = Date.now();
  const jsonlPath = path.resolve(LOG_DIR, `${engine}.jsonl`);
  fs.appendFileSync(
    jsonlPath,
    JSON.stringify({ engine, type, timestamp, payload }) + "\n"
  );
}

export async function getRecentEvents(limit = 10) {
  return []; // no DB, stubbed
}

export async function clearLedger() {
  // wipe JSONL logs
  fs.readdirSync(LOG_DIR).forEach(file => {
    if (file.endsWith(".jsonl")) {
      fs.writeFileSync(path.join(LOG_DIR, file), "");
    }
  });
}
