// test/metaHarnessTest.js
import { runTicks } from "../harness/tickHarness.js";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
  { id: "p3", score: 0 },
];

async function main() {
  const session = await runTicks({ ticks: 15, players });
  console.log("Narrative highlights:");
  session.forEach(({ tick, enriched }) => {
    if (enriched.length > 0) {
      console.log(`Tick ${tick}:`, enriched);
    }
  });
}

main();
