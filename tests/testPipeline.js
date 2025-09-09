// tests/testPipeline.js
/**
 * testPipeline v0.2
 * Purpose: Minimal pipeline: modeEngine + adapter + eventEngine.
 * Inputs:  MOCK_CSV; ruleset from rulesets/backyardUltra.ruleset.json
 * Outputs: Console checks; writes metrics line into outputs/logs/.
 * Notes:   Adapter spec: fetchEvents returns only schema-valid events,
 *          so invalid count is expected to be 0 here.
 * Run:     node tests/testPipeline.js
 */
import { createModeEngine } from "../engines/modeEngine.js";
import { createBackyardCsvAdapter } from "../adapters/backyardCsvAdapter.js";
import { createEventEngine } from "../engines/eventEngine.js";

const MOCK_CSV = [
  "id,athlete,crew,src_type,lap,split_sec,total_sec,rank,laps_completed,seconds_to_cutoff,ts_unix",
  "e1,ath_1,crewA,lap,1,3590,3590,1,1,10,1700000001",
  "e2,ath_2,,lap,1,3650,3650,2,1,0,1700000002",
  "e3,ath_1,crewA,lap,2,3700,7290,1,2,300,1700003600",
  "e4,ath_3,crewC,eliminated,0,0,7290,3,1,0,1700003601",
  "e5,ath_9,,unknown,3,3500,10000,5,3,120,1700007200", // adapter rejects
  "e6,ath_1,crewA,finished,0,0,86400,1,24,0,1700086400"
].join("\n");

function assert(cond, msg) {
  if (!cond) { console.error("❌", msg); process.exitCode = 1; }
  else { console.log("✅", msg); }
}

async function main() {
  console.log("— Pipeline Harness —");
  const mode = createModeEngine({ rulesetPath: "rulesets/backyardUltra.ruleset.json" });
  const ruleset = mode.getRuleset();

  const adapter = createBackyardCsvAdapter({
    ruleset,
    source: { type: "string", data: MOCK_CSV }
  });
  await adapter.connect();

  const engine = createEventEngine({ adapter, ruleset });
  const res = await engine.runOnce(0);

  console.log("Valid events:", res.events_valid.length);
  console.log("Invalid events:", res.events_invalid.length);

  assert(res.events_valid.length === 5, "eventEngine produced 5 valid events");
  // Adapter already rejected the unknown row, so invalid should be 0
  assert(res.events_invalid.length === 0, "eventEngine dropped 0 invalid events (adapter filtered upstream)");
  assert(mode.getTemplates().play_by_play?.length > 0, "modeEngine exposes templates");
  assert(mode.getBroadcastHints().hud_overlays?.length > 0, "modeEngine exposes broadcast hints");

  await adapter.disconnect();
  console.log("\nAll pipeline checks complete.");
}

main().catch(err => { console.error("Harness error:", err); process.exit(1); });
