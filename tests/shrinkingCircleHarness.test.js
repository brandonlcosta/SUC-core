// tests/shrinkingCircleHarness.test.js
import assert from "assert";

console.log("\n=== Shrinking Circle Harness ===");

const circle = { radius: 100 };
circle.radius -= 10;
assert.strictEqual(circle.radius, 90);

console.log("✅ PASS: Shrinking Circle Harness");
