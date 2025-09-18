// File: backend/services/pipelineService.js
// Orchestrates the full reducer pipeline and writes outputs

import { runEventEngine } from "../engines/eventEngine.js";
import { runModeEngine } from "../engines/modeEngine.js";
import { runScoringEngine } from "../engines/scoringEngine.js";
import { runRosterEngine } from "../engines/rosterEngine.js";
import { runMetaEngine } from "../engines/metaEngine.js";
import { runStoryEngine } from "../engines/storyEngine.js";
import { runCommentaryEngine } from "../engines/commentaryEngine.js";
import { runBroadcastEngine } from "../engines/broadcastEngine.js";
import { runRecapEngine } from "../engines/recapEngine.js";
import { runDailyEngine } from "../engines/dailyEngine.js";
import { runOperatorControls } from "../engines/operatorControls.system.js";
import { runSponsorEngine } from "../engines/sponsorEngine.js";
import { runSpatialEngine } from "../engines/spatialEngine.js";
import { runOverlayEngine } from "../engines/overlayEngine.js";

/**
 * Main pipeline function.
 * @param {Array<Object>} rawEvents
 * @param {Array<Object>} overrides
 * @param {Array<Object>} sponsorActions
 * @returns {Object} pipeline outputs (broadcastTick, recap, daily, commentary, etc.)
 */
export async function runPipeline(rawEvents, overrides = [], sponsorActions = []) {
  // Event normalization
  const events = runEventEngine(rawEvents);

  // Active mode / ruleset
  const mode = runModeEngine(events);

  // Scoring updates
  const scoring = runScoringEngine(events, mode);

  // Roster updates
  const roster = runRosterEngine(events);

  // Meta: rivalries, projections, highlight priority
  const meta = runMetaEngine(events, scoring);

  // Story arcs
  const stories = runStoryEngine(events, meta);

  // Commentary (persona-driven)
  const commentary = runCommentaryEngine(events, stories);

  // Operator overrides
  const ops = runOperatorControls(overrides);

  // Sponsor slot updates
  const sponsors = runSponsorEngine(sponsorActions);

  // Spatial/geo analysis
  const spatial = runSpatialEngine(events);

  // Overlay composition
  const overlays = runOverlayEngine(events, meta, stories, sponsors);

  // Broadcast schema package
  const broadcast = runBroadcastEngine({
    events,
    scoring,
    roster,
    meta,
    stories,
    commentary,
    overlays,
    sponsors,
    spatial,
    ops,
  });

  // Recap + Daily summaries
  const recap = runRecapEngine(events, scoring, stories);
  const daily = runDailyEngine(events, stories, sponsors);

  return { broadcast, recap, daily, commentary, roster };
}

// Service wrapper class
export class PipelineService {
  async run(rawEvents, overrides = [], sponsorActions = []) {
    return await runPipeline(rawEvents, overrides, sponsorActions);
  }
}

// Default singleton instance
const pipelineService = new PipelineService();
export default pipelineService;
