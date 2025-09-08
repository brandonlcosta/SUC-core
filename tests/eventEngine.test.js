import assert from "assert";

console.log("=== Event Engine ===");

try {
  const engineModule = await import("../engines/eventEngine.js");

  // Just verify the module has keys
  const keys = Object.keys(engineModule);
  console.log("Exports:", keys);

  assert.ok(keys.length > 0, "Event Engine module should export something");
  console.log("✅ PASS: Event Engine");
} catch (err) {
  console.error("❌ FAIL: Event Engine", err);
  throw err;
}
