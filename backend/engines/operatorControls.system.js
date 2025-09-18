// File: backend/engines/operatorControls.system.js
// Reducer: operator override actions for live broadcast

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/operator_overrides.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/operatorControls.schema.json");

// Supported actions
const ACTIONS = ["SKIP_BUMPER", "PIN_ARC", "REPLAY", "MUTE_ROLE", "TRIGGER_SPONSOR"];

/**
 * Reducer: apply operator action to broadcast state
 * @param {Object} state - current broadcast state
 * @param {Object} action - operator action { type, payload }
 * @returns {Object} updated state
 */
export function operatorReducer(state = {}, action = {}) {
  if (!action || !ACTIONS.includes(action.type)) return state;

  switch (action.type) {
    case "SKIP_BUMPER":
      return { ...state, skip_bumper: true };

    case "PIN_ARC":
      return { ...state, pinned_arc: action.payload };

    case "REPLAY":
      return { ...state, replay: action.payload };

    case "MUTE_ROLE":
      return {
        ...state,
        muted_roles: [...(state.muted_roles || []), action.payload],
      };

    case "TRIGGER_SPONSOR":
      return { ...state, sponsor_override: action.payload };

    default:
      return state;
  }
}

/**
 * Persist operator action log
 */
export function logOperatorAction(action) {
  try {
    const entry = {
      ...action,
      timestamp: Date.now(),
    };

    const valid = validateAgainstSchema(SCHEMA_PATH, entry);
    if (!valid) {
      console.error("❌ Invalid operator action schema", entry);
      return;
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.appendFileSync(OUTPUT_PATH, JSON.stringify(entry) + "\n");
    console.log("🎛️ Logged operator action", entry);
  } catch (err) {
    console.error("❌ Failed to log operator action", err);
  }
}

// ✅ Default export for server.js clean imports
export default {
  operatorReducer,
  logOperatorAction,
};
