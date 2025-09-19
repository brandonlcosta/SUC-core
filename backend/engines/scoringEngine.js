// File: backend/engines/scoringEngine.js

import { loadConfig } from "../services/configLoader.js";

/**
 * Applies scoring rules from the active mode ruleset.
 * Engine is a dumb calculator — logic comes from JSON configs.
 *
 * @param {Object} event - normalized event from EventEngine
 * @param {string} mode - active mode, e.g. "backyardUltra"
 * @param {Object} state - current leaderboard state (athlete_id → score)
 * @returns {Object} updated leaderboard state
 */
export function applyScoring(event, mode, state = {}) {
  const ruleset = loadConfig(`${mode}.ruleset.json`, "rulesets");

  if (!ruleset || !ruleset.scoring) {
    throw new Error(`[ScoringEngine] Missing scoring config in ruleset for mode: ${mode}`);
  }

  const { scoring } = ruleset;
  let scoreDelta = 0;

  // Base scoring by event type
  if (scoring[event.type]) {
    scoreDelta = scoring[event.type];
  }

  // Streak bonuses (if defined in ruleset)
  if (event.streak && scoring.streak_bonus) {
    scoreDelta += scoring.streak_bonus * event.streak;
  }

  // Diminishing returns (optional, ruleset-defined)
  if (scoring.diminishing_returns) {
    const attempts = state.__attempts?.[event.athlete_id]?.[event.type] || 0;
    const factor = Math.pow(scoring.diminishing_returns.factor, attempts);
    scoreDelta = Math.floor(scoreDelta * factor);
  }

  // Update athlete score
  const newScore = (state[event.athlete_id] || 0) + scoreDelta;

  // Track attempts for diminishing returns
  const attempts = {
    ...(state.__attempts || {}),
    [event.athlete_id]: {
      ...(state.__attempts?.[event.athlete_id] || {}),
      [event.type]: (state.__attempts?.[event.athlete_id]?.[event.type] || 0) + 1,
    },
  };

  return {
    ...state,
    [event.athlete_id]: newScore,
    __attempts: attempts,
  };
}

/**
 * Applies scoring across multiple events.
 *
 * @param {Array} events - list of normalized events
 * @param {string} mode - active mode
 * @param {Object} state - current leaderboard state
 * @returns {Object} updated leaderboard state
 */
export function applyScoringBatch(events, mode, state = {}) {
  return events.reduce((acc, ev) => applyScoring(ev, mode, acc), state);
}
