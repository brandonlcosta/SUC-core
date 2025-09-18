// File: backend/engines/metaEngine.js

import fs from "fs";
import path from "path";

const OUTPUT_PATH = path.resolve("backend/outputs/broadcast/meta.json");

/**
 * MetaEngine
 * Controls broadcast mode and session metadata
 */
export class MetaEngine {
  constructor() {
    this.currentMode = "marathon"; // default
    this.sessionId = `session_${Date.now()}`;
  }

  setMode(mode) {
    this.currentMode = mode;
    this.writeMeta();
  }

  writeMeta() {
    const payload = {
      mode: this.currentMode,
      session_id: this.sessionId,
      timestamp: Math.floor(Date.now() / 1000),
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
    return payload;
  }
}
