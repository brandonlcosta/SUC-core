// engines/loggerEngine.js
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
