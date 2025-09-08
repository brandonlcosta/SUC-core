// modeEngine.test.js
import fs from "fs";
import path from "path";

console.log("=== Mode Engine ===");

try {
  // point to correct configs folder
  const rulesetsPath = path.resolve("configs/rulesets.json");
  const rulesets = JSON.parse(fs.readFileSync(rulesetsPath, "utf-8"));

  console.log("Loaded rulesets:", Object.keys(rulesets));
  console.log("✅ PASS: Mode Engine");
} catch (err) {
  console.error("❌ FAIL: Mode Engine", err);
  throw err;
}
