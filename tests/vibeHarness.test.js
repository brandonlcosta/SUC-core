// tests/vibeHarness.test.js
import assert from "assert";

console.log("\n=== Vibe Harness ===");

const vibes = [
  { id: "v1", vibe: 0, role: "chaos" },
  { id: "v2", vibe: 9, role: "echo" },
  { id: "v3", vibe: 8, role: "echo" }
];

assert.ok(vibes.some(v => v.role === "chaos"));
console.table(vibes);

console.log("✅ PASS: Vibe Harness");
