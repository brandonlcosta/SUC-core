/**************************************************
 * Mode Engine v1.1
 * Purpose: Load active ruleset JSON + validate events
 * Includes: Shrinking Circle elimination mode
 **************************************************/

import fs from "fs";

export class ModeEngine {
  constructor(rulesetPath) {
    this.ruleset = JSON.parse(fs.readFileSync(rulesetPath));
    this.eliminated = new Set();
  }

  getRuleset() {
    return this.ruleset;
  }

  isValidEventType(eventType) {
    return this.ruleset.event_types.includes(eventType);
  }

  getScoringValue(eventType) {
    return this.ruleset.scoring?.[eventType] ?? 0;
  }

  getCommentaryTemplates(role) {
    return this.ruleset.commentary_templates?.[role] || [];
  }

  getBroadcastHints() {
    return this.ruleset.broadcast_hints || {};
  }

  // --- Shrinking Circle Logic ---
  applyShrinkingCircle(event) {
    if (event.event_type === "circle_shrink") {
      const eliminatedAthletes = event.metadata?.eliminated || [];
      eliminatedAthletes.forEach(a => this.eliminated.add(a));
    }
  }

  isEliminated(athleteId) {
    return this.eliminated.has(athleteId);
  }
}

export default ModeEngine;
