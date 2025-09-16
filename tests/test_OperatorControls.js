// /tests/testOperatorControls.js
import { operatorOverride } from "../backend/engines/operatorControls.system.js";

let tick = {
  recap: { highlight_reel: ["Sophia dominant streak until Lap 23"] },
  ticker: ["Lap 5 update", "Lap 6 update"],
  hud: { overlays: [] },
};

// Test PIN_ARC
tick = operatorOverride(tick, { type: "PIN_ARC", payload: { label: "Emily vs James pinned" } });

// Test SKIP_BUMPER
tick = operatorOverride(tick, { type: "SKIP_BUMPER", payload: { line: "Lap 5 update" } });

// Test MUTE_ROLE
tick = operatorOverride(tick, { type: "MUTE_ROLE", payload: { role: "commentator1" } });

// Test REPLAY
tick = operatorOverride(tick, { type: "REPLAY", payload: { overlay: { sponsor: "Topo Shoes" } } });

console.log("Mutated Tick:");
console.log(JSON.stringify(tick, null, 2));
