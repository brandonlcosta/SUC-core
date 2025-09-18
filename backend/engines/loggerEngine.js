// File: backend/engines/loggerEngine.js
// Logger Engine v2.0 — persistent + console logging

export class LoggerEngine {
  constructor(config = {}) {
    this.logs = [];
    this.config = config;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}`;
    this.logs.push(entry);
    console.log(entry);
  }

  getLogs() {
    return this.logs;
  }
}

// ✅ Default export: singleton instance
const loggerEngine = new LoggerEngine();
export default loggerEngine;
