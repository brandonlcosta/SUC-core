// File: backend/services/rosterService.js

import fs from "fs";
import path from "path";
import { ensureOutputDir, OUTPUT_DIR } from "../utils/paths.js";

const OUTPUT_PATH = path.join(OUTPUT_DIR, "roster.json");

export class RosterService {
  constructor() {
    this.roster = [];
  }

  setRoster(data) {
    this.roster = data;
    this.writeRoster();
  }

  writeRoster() {
    ensureOutputDir();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(this.roster, null, 2));
  }
}
