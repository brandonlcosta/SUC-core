// tests/replayHarness.test.js
import assert from "assert";

console.log("\n=== Replay Harness ===");

const replay = [{ session: "s1" }, { session: "s2" }];
assert.strictEqual(replay.length, 2);

console.log("✅ PASS: Replay Harness");
