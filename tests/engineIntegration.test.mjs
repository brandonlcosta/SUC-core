// tests/engineIntegration.test.mjs
import { initBroadcast } from "../backend/engines/broadcastEngine.js";
import { createCommentaryEngine } from "../backend/engines/commentaryEngine.js";

const broadcast = initBroadcast();
console.log("Broadcast keys:", Object.keys(broadcast));

const commentary = createCommentaryEngine();
const sample = commentary.generate({
  event: { type: "goal", team: "Blue", player: "Alice" },
  rulesetTemplates: {
    play_by_play: ["{player} scores for {team}!"],
    analyst: ["That’s a strong play."],
  },
});
console.log("Commentary lines:", sample.lines);

console.log("✅ Engine integration smoke test passed");
