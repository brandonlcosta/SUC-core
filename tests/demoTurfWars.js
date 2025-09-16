// /tests/demoTurfWars.js
// Demo harness: generates random Turf Wars events and runs pipeline

import runPipeline from "../backend/services/pipelineService.js";
import fs from "fs";
import { generateTurfWarsEvents } from "./utils/randomRaceGenerator.js";

async function demoTurfWars() {
  console.log("🚀 Running Turf Wars demo with synthetic events...");

  // Generate random events
  const rawEvents = generateTurfWarsEvents(12, 150);

  // Run pipeline
  const outputs = await runPipeline(rawEvents);

  // Persist outputs
  fs.mkdirSync("./outputs", { recursive: true });
  fs.writeFileSync("./outputs/demoTurfWars.json", JSON.stringify(outputs, null, 2));
  console.log("✅ Turf Wars demo outputs written to ./outputs/demoTurfWars.json");
}

demoTurfWars();
