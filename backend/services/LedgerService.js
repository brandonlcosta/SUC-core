// File: backend/services/ledgerService.js
import fs from "fs";
import path from "path";

const LEDGER_FILE = path.resolve("./outputs/logs/broadcastTicks.jsonl");

// Ensure directory exists
fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });

/**
 * Append a tick to the broadcast ledger
 * @param {Object} tick - broadcastTick event
 */
export function appendTick(tick) {
  try {
    fs.appendFileSync(LEDGER_FILE, JSON.stringify(tick) + "\n");
  } catch (err) {
    console.warn("⚠️ Failed to append tick to ledger", err);
  }
}

/**
 * Read all ticks from the ledger (for replay/rollback)
 * @returns {Array} Array of parsed tick objects
 */
export function readTicks() {
  try {
    if (!fs.existsSync(LEDGER_FILE)) return [];
    const lines = fs.readFileSync(LEDGER_FILE, "utf-8").trim().split("\n");
    return lines.map((line) => JSON.parse(line));
  } catch (err) {
    console.warn("⚠️ Failed to read ledger", err);
    return [];
  }
}
