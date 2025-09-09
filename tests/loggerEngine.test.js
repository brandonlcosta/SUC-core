// tests/loggerEngine.test.js
import assert from "assert";
import logger from "../engines/loggerEngine.js";   // ✅ correct path

console.log("\n=== Logger Engine ===");

const schema = {
  type: "object",
  properties: {
    type: { type: "string" },
    message: { type: "string" }
  },
  required: ["type", "message"]
};

// Reset session log
logger.clearLog("testSession");

// Register schema
logger.registerSchema("event", schema);

// Emit logs
logger.emitLog("testSession", "event", { type: "info", message: "Hello" });
logger.emitLog("testSession", "event", { type: "info", message: "World" });

// Read logs
const logs = logger.readLogs("testSession");
assert.strictEqual(logs.length, 2, "Should have 2 log entries");

// Clear logs
logger.clearLog("testSession");
const cleared = logger.readLogs("testSession");
assert.strictEqual(cleared.length, 0, "Log should be cleared");

console.log("✅ PASS: Logger Engine");
