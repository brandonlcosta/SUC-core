// /backend/engines/operatorControls.system.js
// Reducer: operator override actions for live broadcast

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/operator_overrides.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/operatorControls.schema.json");

// Supported actions
const ACTIONS = ["SKIP_BUMPER", "PIN_ARC", "REPLAY", "MUTE_ROLE"];

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
    default:
      return state;
  }
}

/**
 * Run operator controls system, persist overrides
 * @param {Object} state - current broadcast state
 * @param {Object} action - operator action
 * @returns {Object} updated state
 */
export function runOperatorControls(state, action) {
  const updated = operatorReducer(state, action);

  const valid = validateAgainstSchema(SCHEMA_PATH, updated);
  if (!valid) {
    console.error("❌ OperatorControls schema validation failed");
    return state;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(updated, null, 2));
  console.log(`✅ OperatorControls wrote ${OUTPUT_PATH}`);

  return updated;
}

export default runOperatorControls;
