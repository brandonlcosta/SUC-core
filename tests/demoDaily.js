// /tests/demoDaily.js
// Demo harness: generates daily.json from sample events + meta

import { runDailyEngine } from "../backend/engines/dailyEngine.js";
import fs from "fs";

async function demoDaily() {
  console.log("🚀 Running Daily demo...");

  // Load mock events + meta
  const events = JSON.parse(fs.readFileSync("./tests/mocks/dailyEvents.json", "utf-8"));
  const meta = JSON.parse(fs.readFileSync("./tests/mocks/dailyMeta.json", "utf-8"));

  const daily = runDailyEngine(events, meta);

  fs.writeFileSync("./outputs/demoDaily.json", JSON.stringify(daily, null, 2));
  console.log("✅ Daily demo outputs written to ./outputs/demoDaily.json");
}

demoDaily();
