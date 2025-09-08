/**************************************************
 * Arc Harness v3
 * Purpose: Validate arc continuity (rivalries, comebacks)
 **************************************************/

import ArcEngine from "../engines/arcEngine.js";

const narrativeEvents = [
  { event_id: "n1", base_statement: "Athlete A captured Turf 1", metadata: { rival: "Athlete B", arc_type: "rivalry", title: "A vs B Rivalry" }, highlight_priority: 8, timestamp: Date.now() },
  { event_id: "n2", base_statement: "Athlete B fought back", metadata: { rival: "Athlete A", arc_type: "rivalry", title: "A vs B Rivalry" }, highlight_priority: 9, timestamp: Date.now() + 5000 }
];

(async function runTest() {
  console.log("\n=== Arc Harness ===");

  try {
    const engine = new ArcEngine();
    engine.processBatch(narrativeEvents);

    const arcs = engine.getAllArcs();
    console.dir(arcs, { depth: null });

    if (!arcs.length) throw new Error("No arcs created");
    if (!arcs.some(a => a.arc_type === "rivalry")) throw new Error("No rivalry arc detected");

    console.log("✅ PASS: Arc Harness");
  } catch (err) {
    console.error("❌ FAIL: Arc Harness →", err.message);
  }
})();
