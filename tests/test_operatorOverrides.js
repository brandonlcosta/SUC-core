import broadcastEngine from "../backend/engines/broadcastEngine.js";
import storyEngine from "../backend/engines/storyEngine.js";
import OperatorControls from "../backend/systems/operatorControls.system.js";

const operatorControls = new OperatorControls({
  broadcastEngine,
  storyEngine
});

// Test skip bumper
operatorControls.skipBumper("bumper123", "opX");
const tick = broadcastEngine.process({
  ts: Date.now(),
  ticker: "Start sequence",
  hud: {},
  highlights: [],
  recap: {},
  bumpers: [{ id: "bumper123" }, { id: "bumper456" }]
});
console.log("broadcastEngine bumpers after skip:", tick.bumpers);

// Test story overrides
operatorControls.pinArc("arc42", "opX");
operatorControls.replayHighlight("highlight99", "opX");
const storyTick = storyEngine.process({ arcs: [] });
console.log("storyEngine output:", storyTick);
