// test/fullStackToggleTest.js
import { runTicks } from "../harness/tickHarness.js";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
];

async function main() {
  console.log("Running Narrative Stack with toggles from defaults...");
  const session = await runTicks({ ticks: 10, players });
  console.log("Broadcast recap (if enabled):");
  session.forEach(({ tick, broadcastEvents }) => {
    if (broadcastEvents.length > 0) {
      console.log(`Tick ${tick}:`, broadcastEvents[0]);
    }
  });
}

main();
