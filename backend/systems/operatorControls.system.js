import operatorConsole, { ACTIONS } from "./engines/operatorConsole.js";

/**
 * OperatorControls system
 * Wraps override actions with engine-side effects.
 */
export class OperatorControls {
  constructor({ broadcastEngine, storyEngine, scoringEngine }) {
    this.broadcastEngine = broadcastEngine;
    this.storyEngine = storyEngine;
    this.scoringEngine = scoringEngine;
  }

  skipBumper(bumperId, operatorId) {
    operatorConsole.dispatch(ACTIONS.SKIP_BUMPER, bumperId, operatorId);
    // engine hook: remove bumper from broadcast feed
    if (this.broadcastEngine?.skipBumper) {
      this.broadcastEngine.skipBumper(bumperId);
    }
  }

  pinArc(arcId, operatorId) {
    operatorConsole.dispatch(ACTIONS.PIN_ARC, arcId, operatorId);
    // engine hook: pin a story arc
    if (this.storyEngine?.pinArc) {
      this.storyEngine.pinArc(arcId);
    }
  }

  replayHighlight(highlightId, operatorId) {
    operatorConsole.dispatch(ACTIONS.REPLAY, highlightId, operatorId);
    // engine hook: replay highlight
    if (this.storyEngine?.replayHighlight) {
      this.storyEngine.replayHighlight(highlightId);
    }
  }

  muteRole(roleId, operatorId) {
    operatorConsole.dispatch(ACTIONS.MUTE_ROLE, roleId, operatorId);
    // engine hook: mute role in commentary/scoring
    if (this.scoringEngine?.muteRole) {
      this.scoringEngine.muteRole(roleId);
    }
  }
}

export default OperatorControls;
