// tests/harnessV3Test.js
import { runTicks, regressionTest } from "../harness/tickHarness.js";

const players = [{ id: "p1", score: 0 }, { id: "p2", score: 0 }];

async function main() {
  console.log("Running baseline session...");
  await runTicks({ ticks: 5, players });

  console.log("\nRunning regression test against baseline...");
  await regressionTest("narrativeSession.json", { ticks: 5, players });
}

main();
