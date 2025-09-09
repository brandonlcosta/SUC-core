// tests/test_recognitionGraph.js
import { createWorld } from "../ecs/world.js";
import { recognitionGraphSystem, makeEvent } from "../engines/recognitionGraph.system.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsPath = path.join(__dirname, "mocks", "mockEvents.json");
const events = JSON.parse(await readFile(eventsPath, "utf8"));

(async function run() {
  console.log("\n=== Testing: Recognition Graph v0 ===");
  const world = createWorld();
  world.registerSystem(recognitionGraphSystem());

  for (const ev of events) {
    const id = world.addEntity();
    world.addComponent(id, makeEvent(ev));
  }

  await world.tick();

  const g = world.query(["EventHistory","RivalryIndex","StreakIndex"])[0].components;
  const rivCount = Object.values(g.get("RivalryIndex")).reduce((a,b)=>a+b,0);
  const streakA = g.get("StreakIndex")["A"]["K2"];

  console.log("Rivalry trades:", rivCount);
  console.log("A@K2 streak:", streakA);

  if (rivCount < 2) throw new Error("Expected at least 2 rivalry trades");
  if (streakA < 2) throw new Error("Expected streak >= 2 for A@K2");

  console.log("✅ Recognition Graph passed");
})();
