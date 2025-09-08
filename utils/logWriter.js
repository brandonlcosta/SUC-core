/**************************************************
 * Log Writer
 * Purpose: Persist events/signals for replay + recaps
 **************************************************/

import fs from "fs";
import path from "path";

const LOG_DIR = "./suc-core/outputs/logs";

export function writeLog(sessionId, signal) {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  const file = path.join(LOG_DIR, `session-${sessionId}.json`);

  let existing = [];
  if (fs.existsSync(file)) {
    existing = JSON.parse(fs.readFileSync(file));
  }
  existing.push(signal);
  fs.writeFileSync(file, JSON.stringify(existing, null, 2));
}

export function readLog(sessionId) {
  const file = path.join(LOG_DIR, `session-${sessionId}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`No log found for session ${sessionId}`);
  }
  return JSON.parse(fs.readFileSync(file));
}
