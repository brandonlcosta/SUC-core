// tests/metaV2Test.js
import { runTicks } from "../harness/tickHarness.js";

const players = [
  { id: "p1", score: 0 },
  { id: "p2", score: 0 },
  { id: "p3", score: 0 },
];

async function main() {
  const session = await runTicks({ ticks: 12, players });
  console.log("Meta highlights with projections/leaderboards:");
  session.forEach(({ tick, metaEvents }) => {
    metaEvents.forEach(e => {
      if (["LEADERBOARD_UPDATE", "PROJECTION"].includes(e.type)) {
        console.log(`Tick ${tick}:`, e);
      }
    });
  });
}

main();
