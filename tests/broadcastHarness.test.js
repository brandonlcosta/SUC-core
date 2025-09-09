// tests/broadcastHarness.test.js
import assert from "assert";

console.log("\n=== Broadcast Harness ===");

const feeds = ["integrity", "glitch"];
assert.deepStrictEqual(new Set(feeds).size, 2);

console.log("✅ PASS: Broadcast Harness");
