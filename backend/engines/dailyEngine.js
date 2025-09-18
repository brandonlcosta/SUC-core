// File: backend/engines/dailyEngine.js

import schemaGate from "../services/schemaGate.js";
import ledgerService from "../services/ledgerService.js";
import operatorService from "../services/operatorService.js";

/**
 * Named export for pipelineService
 * Produces daily.json (anchors, trends, sponsor, clips)
 */
export function runDailyEngine(events, state, ctx) {
  let daily = {
    date: new Date().toISOString().split("T")[0],
    anchors: buildAnchors(ctx),
    sponsor: pickSponsor(ctx),
    clips: buildClips(ctx)
  };

  // Apply operator overrides (replace sponsor, pin anchor, remove clip, etc.)
  daily = operatorService.applyDailyOverrides(daily);

  // Validate schema
  schemaGate.validate("daily", daily);

  // Ledger logging
  ledgerService.event({
    engine: "daily",
    type: "summary",
    payload: {
      anchors: daily.anchors?.length || 0,
      clips: daily.clips?.length || 0,
      sponsor: daily.sponsor || "none"
    }
  });

  // Enrich pipeline context
  ctx.daily = daily;

  return daily;
}

/**
 * Optional class for extendability
 */
export class DailyEngine {
  run(events, state, ctx) {
    return runDailyEngine(events, state, ctx);
  }
}

/**
 * Default singleton export
 */
const dailyEngine = new DailyEngine();
export default dailyEngine;

/* --------------------------
   Internal Helpers
--------------------------- */

function buildAnchors(ctx) {
  const anchors = [];

  if (ctx.story?.arcs?.length) {
    anchors.push("today’s rivalry");
  }
  if (ctx.meta?.highlights?.some(h => h.type === "comeback")) {
    anchors.push("comeback story");
  }
  if (ctx.scoring?.laps) {
    anchors.push("lap leaders");
  }

  return anchors.slice(0, 3); // top 3 anchors max
}

function pickSponsor(ctx) {
  // Sponsor selection could come from ctx.sponsor or operatorService
  return ctx.sponsor?.active || "Red Bull";
}

function buildClips(ctx) {
  return (ctx.recap?.highlight_reel || []).map(h => `clip_${h}.mp4`);
}
