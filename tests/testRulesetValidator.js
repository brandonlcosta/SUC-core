/**************************************************
 * testRulesetValidator v0.1
 * Purpose: Minimal console harness for rulesetValidator.
 * Inputs:  Loads backyardUltra.ruleset.json, crafts good/bad events.
 * Outputs: Console logs indicating pass/fail expectations.
 * Notes:   Pure Node; <=150 LOC. Run: `node tests/testRulesetValidator.js`
 **************************************************/

import { loadRuleset, validateEvent, validateEventsBatch, validateRuleset } from "../utils/rulesetValidator.js";

const RULESET_PATH = "rulesets/backyardUltra.ruleset.json";

function assert(cond, msg) {
  if (!cond) {
    console.error("❌", msg);
    process.exitCode = 1;
  } else {
    console.log("✅", msg);
  }
}

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

function main() {
  console.log("— Ruleset Validator Harness —");
  let ruleset;
  try {
    ruleset = loadRuleset(RULESET_PATH);
    console.log("Loaded ruleset:", ruleset.name);
    const rsRes = validateRuleset(ruleset);
    assert(rsRes.ok, "Ruleset structure & snake_case validated");
  } catch (e) {
    console.error("Failed to load/validate ruleset:", e.message);
    process.exit(1);
  }

  const goodEvent = {
    event_id: "evt_001",
    event_type: "lap_split",
    athlete_id: "ath_123",
    timestamp: nowUnix(),
    metadata: {
      lap: 12,
      split_time_sec: 3175,
      total_time_sec: 38100,
      laps_completed: 12,
      projected_pace_min_per_mi: 11.0,
      time_on_course_h: 10.6,
      rank: 3,
      seconds_to_cutoff: 245
    }
  };

  const goodRes = validateEvent(goodEvent, ruleset);
  assert(goodRes.ok, "Valid event passes");

  const badEvent = {
    eventId: "evt_002",
    event_type: "unknown_type",
    athlete_id: "ath_999",
    timestamp: nowUnix()
  };

  const badRes = validateEvent(badEvent, ruleset);
  assert(!badRes.ok, "Invalid event fails");
  console.log("Errors (expected):", badRes.errors);

  const batch = validateEventsBatch([goodEvent, badEvent], ruleset);
  assert(!batch.ok && batch.invalid_indices.length === 1 && batch.invalid_indices[0] === 1, "Batch flags only the bad event");

  console.log("\nAll checks complete.");
}

main();
