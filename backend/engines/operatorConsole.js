import fs from "fs";
import path from "path";
import schemaGate from "../../utils/SchemaGate.js";

const OUTPUT_DIR = path.join(process.cwd(), "outputs", "logs");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export const ACTIONS = {
  SKIP_BUMPER: "SKIP_BUMPER",
  PIN_ARC: "PIN_ARC",
  REPLAY: "REPLAY",
  MUTE_ROLE: "MUTE_ROLE"
};

export class OperatorConsole {
  constructor() {
    this.logPath = path.join(OUTPUT_DIR, "metrics.jsonl");
  }

  /**
   * Dispatch an operator action.
   * @param {string} action - One of ACTIONS
   * @param {string} target - Target entity (arc id, role, bumper id)
   * @param {string} operatorId - Operator issuing the command
   */
  dispatch(action, target, operatorId = "system") {
    const event = {
      ts: Date.now(),
      action,
      target,
      operatorId
    };

    // Validate schema
    schemaGate.validate("operatorMetrics", event);

    // Append to metrics log
    fs.appendFileSync(this.logPath, JSON.stringify(event) + "\n");

    return event;
  }
}

// Singleton export
export default new OperatorConsole();
