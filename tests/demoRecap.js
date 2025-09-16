// /tests/demoRecap.js
// Demo harness: generates recap.json from sample events

import { runRecapEngine } from "../backend/engines/recapEngine.js";
import fs from "fs";

async function demoRecap() {
  console.log("🚀 Running Recap demo...");

  // Load mock event history (laps, dnfs, rivalries)
  const events = JSON.parse(fs.readFileSync("./tests/mocks/recapEvents.json", "utf-8"));

  const recap = runRecapEngine(events);

  fs.writeFileSync("./outputs/demoRecap.json", JSON.stringify(recap, null, 2));
  console.log("✅ Recap demo outputs written to ./outputs/demoRecap.json");
}

demoRecap();
