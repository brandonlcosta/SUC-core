// /backend/engines/rosterEngine.js
// Reducer: tracks athlete + crew context across events

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/roster.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/roster.schema.json");

/**
 * Reducer: build roster state from events
 * @param {Array<Object>} events - normalized events
 * @returns {Object} roster
 */
export function rosterReducer(events = []) {
  const roster = {};

  events.forEach((evt) => {
    if (!evt.athleteId) return;

    if (!roster[evt.athleteId]) {
      roster[evt.athleteId] = {
        athleteId: evt.athleteId,
        crew: evt.crew || null,
        laps: 0,
        status: "active",
        lastSeen: evt.timestamp || Date.now(),
      };
    }

    // Update laps if event has laps
    if (evt.type === "lap") {
      roster[evt.athleteId].laps += 1;
    }

    // Update DNF if marked
    if (evt.type === "dnf") {
      roster[evt.athleteId].status = "dnf";
    }

    // Always update lastSeen
    roster[evt.athleteId].lastSeen = evt.timestamp || Date.now();
  });

  return { athletes: Object.values(roster) };
}

/**
 * Run roster engine and persist output
 * @param {Array<Object>} events
 * @returns {Object} roster
 */
export function runRosterEngine(events) {
  const roster = rosterReducer(events);

  const valid = validateAgainstSchema(SCHEMA_PATH, roster);
  if (!valid) {
    console.error("❌ RosterEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(roster, null, 2));
  console.log(`✅ RosterEngine wrote ${OUTPUT_PATH}`);

  return roster;
}

export default runRosterEngine;