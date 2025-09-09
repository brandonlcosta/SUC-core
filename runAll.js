// runAll.js
import fs from "fs";
import path from "path";
import { orchestrateHarnesses } from "./tests/harnessOrchestrator.js";

async function runAll() {
  const results = await orchestrateHarnesses();

  const summary = {
    timestamp: new Date().toISOString(),
    passed: results.filter(r => r.status === "PASS").length,
    failed: results.filter(r => r.status === "FAIL").length,
    total: results.length,
    trustScore: results.length
      ? results.filter(r => r.status === "PASS").length / results.length
      : 0
  };

  fs.writeFileSync(
    path.resolve("./greenboard.json"),
    JSON.stringify({ results, summary }, null, 2)
  );

  console.log("Greenboard Summary:", summary);
  process.exit(summary.failed === 0 ? 0 : 1);
}

runAll();
