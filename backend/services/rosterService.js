// File: backend/services/rosterService.js

import fs from "fs";
import path from "path";
import { ensureOutputDir, OUTPUT_DIR } from "../utils/paths.js";

const OUTPUT_PATH = path.join(OUTPUT_DIR, "roster.json");

export class RosterService {
  constructor() {
    this.roster = [];
  }

  /**
   * Set full roster and persist to outputs/roster.json
   * @param {Array<Object>} data - array of athlete objects
   */
  setRoster(data) {
    this.roster = data;
    this.writeRoster();
  }

  /**
   * Write roster to disk
   */
  writeRoster() {
    ensureOutputDir();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(this.roster, null, 2));
  }

  /**
   * Get current roster in memory
   * @returns {Array<Object>}
   */
  getRoster() {
    return this.roster;
  }
}

// Named helper functions for flexibility
export function getRoster() {
  return rosterService.getRoster();
}

export function setRoster(data) {
  return rosterService.setRoster(data);
}

// Default singleton instance
const rosterService = new RosterService();
export default rosterService;
