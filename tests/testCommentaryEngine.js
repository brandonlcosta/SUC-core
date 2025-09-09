/**
 * testCommentaryEngine v0.2
 * Purpose: Validate deterministic, role-balanced output.
 * Run: node tests/testCommentaryEngine.js
 */
import { loadRuleset } from "../utils/rulesetValidator.js";
// Allow both named and default export patterns to be safe.
import defaultCommentary, { createCommentaryEngine } from "../engines/commentaryEngine.js";

const RULESET_PATH = "rulesets/backyardUltra.ruleset.json";
function assert(cond, msg) { if (!cond) { console.error("❌", msg); process.exitCode = 1; } else { console.log("✅", msg); } }
function nowUnix() { return Math.floor(Date.now() / 1000); }

function main() {
  console.log("— Commentary Engine Harness —");
  const ruleset = loadRuleset(RULESET_PATH);

  // Prefer named; fall back to default bundle if needed.
  const factory = typeof createCommentaryEngine === "function"
    ? createCommentaryEngine
    : (defaultCommentary && typeof defaultCommentary.createCommentaryEngine === "function"
        ? defaultCommentary.createCommentaryEngine
        : null);

  assert(typeof factory === "function", "createCommentaryEngine is a function");

  const engine = factory();
  assert(engine && typeof engine.generate === "function", "engine.generate is a function");

  const event = {
    event_id: "evt_pp",
    event_type: "lap_split",
    athlete_id: "ath_1",
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

  const res = engine.generate({
    event,
    rulesetTemplates: ruleset.commentary_templates,
    metaContext: { cutoff_minutes: ruleset.context.cutoff_minutes }
  });

  console.log("Lines:", res.lines);

  const roles = res.lines.map(l => l.role);
  ["play_by_play","analyst","color","wildcard"].forEach(r =>
    assert(roles.includes(r), `contains role: ${r}`)
  );
  res.lines.forEach(l => assert(typeof l.text === "string" && l.text.length > 0, `${l.role} has text`));

  console.log("\nAll commentary checks complete.");
}

main();