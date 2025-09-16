// /backend/services/pipelineService.js
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

export async function runPipeline(rawEvents, overrides = [], sponsorActions = []) {
  // Event normalization
  const events = runEventEngine(rawEvents);

  // Active mode / ruleset
  const mode = runModeEngine(events);

  // Scoring
  const leaderboard = runScoringEngine(events, mode);

  // Roster tracking
  const roster = runRosterEngine(events);

  // Meta analysis
  const meta = runMetaEngine(events, roster);

  // Story arcs
  const stories = runStoryEngine(meta);

  // Commentary
  const commentary = runCommentaryEngine(stories);

  // Broadcast bundle
  const broadcast = runBroadcastEngine({ leaderboard, stories, commentary });

  // Recap reel
  const recap = runRecapEngine(events);

  // Daily recap
  const daily = runDailyEngine(events, meta);

  // Operator overrides
  let broadcastWithOverrides = broadcast;
  overrides.forEach((action) => {
    broadcastWithOverrides = runOperatorControls(broadcastWithOverrides, action);
  });

  // Sponsor integration
  let sponsorState = {};
  sponsorActions.forEach((action) => {
    sponsorState = runSponsorEngine(sponsorState, action);
  });

  // Spatial + overlays
  const spatial = runSpatialEngine(events);
  const overlays = runOverlayEngine(events);

  return {
    events,
    mode,
    leaderboard,
    roster,
    meta,
    stories,
    commentary,
    broadcast: broadcastWithOverrides,
    recap,
    daily,
    sponsorState,
    spatial,
    overlays,
  };
}

export default runPipeline;