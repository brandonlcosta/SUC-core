// File: backend/engines/overlayEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";

export function runOverlayEngine(events, state, ctx) {
  // ✅ Example overlay: leaderboard
  const overlays = [
    {
      overlay_id: "overlay_1",
      overlay_type: "leaderboard",
      priority: 1,
      timestamp: Date.now(),
      data: {
        top_athletes: Object.entries(state.scoring?.points || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([athlete_id, score]) => ({ athlete_id, score }))
      }
    }
  ];

  const overlayPayload = { overlays };

  schemaGate.validate("overlay", overlayPayload);

  ledgerService.event({
    engine: "overlay",
    type: "summary",
    payload: { overlays: overlays.length }
  });

  ctx.overlay = overlayPayload;
  return overlayPayload;
}

export class OverlayEngine {
  run(events, state, ctx) {
    return runOverlayEngine(events, state, ctx);
  }
}

const overlayEngine = new OverlayEngine();
export default overlayEngine;
