// tests/commentaryV2Test.js
import { runTicks } from "../harness/tickHarness.js";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
];

async function main() {
  const session = await runTicks({ ticks: 10, players });
  console.log("Commentary lines (v2):");
  session.forEach(({ tick, commentaryEvents }) => {
    commentaryEvents.forEach(e => {
      console.log(`Tick ${tick}:`, e.commentary);
    });
  });
}

main();
