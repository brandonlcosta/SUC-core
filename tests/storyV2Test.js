// tests/storyV2Test.js
import { runTicks } from "../harness/tickHarness.js";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
  { id: "p3", score: 0 },
];

async function main() {
  const session = await runTicks({ ticks: 12, players });
  console.log("Story arcs (v2):");
  session.forEach(({ tick, storyEvents }) => {
    storyEvents.forEach(e => console.log(`Tick ${tick}:`, e));
  });
}

main();
