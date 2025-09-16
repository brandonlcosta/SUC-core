import schemaGate from "../backend/utils/schemaGate.js";

// Minimal smoke tests
try {
  schemaGate.validate("broadcastTick", {
    ts: Date.now(),
    ticker: "Lap 1 Complete",
    hud: {},
    highlights: [],
    recap: {}
  });
  console.log("broadcastTick ✅");
} catch (err) {
  console.error("broadcastTick ❌", err.message);
}

try {
  schemaGate.validate("operatorMetrics", {
    ts: Date.now(),
    action: "SKIP_BUMPER",
    target: "intro_bumper",
    operatorId: "op123"
  });
  console.log("operatorMetrics ✅");
} catch (err) {
  console.error("operatorMetrics ❌", err.message);
}

try {
  schemaGate.validate("sponsorImpressions", {
    ts: Date.now(),
    sponsorId: "nike",
    slot: "hud_banner",
    durationMs: 3000,
    impressionCount: 1
  });
  console.log("sponsorImpressions ✅");
} catch (err) {
  console.error("sponsorImpressions ❌", err.message);
}
