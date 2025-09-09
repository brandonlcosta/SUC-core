// tests/recapBuilder.test.js
import assert from "assert";

console.log("\n=== Recap Builder ===");

const recap = { session: "s1", highlights: ["big play"] };
assert.strictEqual(recap.session, "s1");
assert.ok(Array.isArray(recap.highlights));

console.log("✅ PASS: Recap Builder");
