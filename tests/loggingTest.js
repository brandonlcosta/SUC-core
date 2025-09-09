// test/loggingTest.js
import { runTicks } from "../harness/tickHarness.js";
import fs from "fs";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
];

async function main() {
  console.log("Running with per-engine logging...");
  await runTicks({ ticks: 5, players });

  console.log("Checking logs:");
  ["metaLog.json", "storyLog.json", "commentaryLog.json", "broadcastLog.json"].forEach(f => {
    console.log(f, "→", fs.existsSync(f) ? "OK" : "MISSING");
  });
}

main();
