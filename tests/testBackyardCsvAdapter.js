/**************************************************
 * testBackyardCsvAdapter v0.2
 * Purpose: Minimal mock-first harness for backyardCsvAdapter.
 * Inputs:  Mock CSV string; real ruleset JSON.
 * Outputs: Console logs; exit code 0 on pass.
 * Notes:   Run: `node tests/testBackyardCsvAdapter.js`
 **************************************************/

import { loadRuleset } from "../utils/rulesetValidator.js";
import { createBackyardCsvAdapter } from "../adapters/backyardCsvAdapter.js";

const RULESET_PATH = "rulesets/backyardUltra.ruleset.json";

const MOCK_CSV = [
  "id,athlete,crew,src_type,lap,split_sec,total_sec,rank,laps_completed,seconds_to_cutoff,ts_unix",
  "e1,ath_1,crewA,lap,1,3590,3590,1,1,10,1700000001",
  "e2,ath_2,,lap,1,3650,3650,2,1,0,1700000002",
  "e3,ath_1,crewA,lap,2,3700,7290,1,2,300,1700003600",
  "e4,ath_3,crewC,eliminated,0,0,7290,3,1,0,1700003601",
  "e5,ath_9,,unknown,3,3500,10000,5,3,120,1700007200",
  "e6,ath_1,crewA,finished,0,0,86400,1,24,0,1700086400"
].join("\n");

function assert(cond, msg) {
  if (!cond) { console.error("❌", msg); process.exitCode = 1; }
  else { console.log("✅", msg); }
}

async function main() {
  console.log("— Backyard CSV Adapter Harness —");
  const ruleset = loadRuleset(RULESET_PATH);

  const adapter = createBackyardCsvAdapter({
    ruleset,
    source: { type: "string", data: MOCK_CSV }
  });

  await adapter.connect();

  const batch1 = await adapter.fetchEvents(0);
  console.log("Batch1 events:", batch1);
  assert(batch1.length === 5, "fetchEvents returns 5 valid events");
  assert(batch1.every(e => ["lap_split","elimination","finish"].includes(e.event_type)), "Allowed event_type only");
  assert(!batch1.find(e => e.event_id === "e5"), "Rejects unknown src_type row");

  const hasLap = batch1.find(e => e.event_type === "lap_split");
  assert(typeof hasLap.metadata.lap === "number", "metadata.lap is number");
  assert(typeof hasLap.metadata.split_time_sec === "number", "metadata.split_time_sec is number");

  const sinceTs = 1700003600; // at e3
  const batch2 = await adapter.fetchEvents(sinceTs);
  console.log("Batch2 events:", batch2);
  assert(batch2.length === 2, "fetchEvents(since) returns only new events");

  await adapter.disconnect();
  console.log("\nAll adapter checks complete.");
}

main().catch(err => { console.error("Harness error:", err); process.exit(1); });