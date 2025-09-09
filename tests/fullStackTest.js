// test/fullStackTest.js
import { runTicks } from "../harness/tickHarness.js";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
];

async function main() {
  console.log("Running Narrative Stack for 10 ticks...");
  const session = await runTicks({ ticks: 10, players });
  console.log("Final broadcast outputs:");
  session.forEach(({ tick, broadcastEvents }) => {
    if (broadcastEvents.length > 0) {
      console.log(`Tick ${tick}:`, broadcastEvents);
    }
  });
}

main();
