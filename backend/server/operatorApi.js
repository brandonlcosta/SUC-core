// File: backend/server/operatorApi.js
// Lightweight operator API using Express (already in repo).
import express from "express";
import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";
import { ledgerOperatorAction } from ".Ledger.js";

const app = express();
app.use(express.json());

const OP_SCHEMA = path.resolve("./backend/schemas/operatorControls.schema.json");
const OP_OUTPUT_PATH = path.resolve("./outputs/broadcast/operator_overrides.json");
fs.mkdirSync(path.dirname(OP_OUTPUT_PATH), { recursive: true });

function readOverrides() {
  try {
    return JSON.parse(fs.readFileSync(OP_OUTPUT_PATH, "utf8"));
  } catch {
    return { skip_bumper: null, pinned_arc: null, replay: null, muted_roles: [] };
  }
}

function writeOverrides(obj) {
  fs.writeFileSync(OP_OUTPUT_PATH, JSON.stringify(obj, null, 2));
}

app.get("/operator/overrides", (_req, res) => {
  res.json(readOverrides());
});

app.post("/operator/dispatch", (req, res) => {
  const { type, payload } = req.body ?? {};
  if (!type) return res.status(400).json({ error: "Missing action type" });

  // apply action → simple reducer
  const state = readOverrides();
  let next = { ...state };

  switch (type) {
    case "SKIP_BUMPER":
      next.skip_bumper = true;
      break;
    case "PIN_ARC":
      next.pinned_arc = payload ?? null;
      break;
    case "REPLAY":
      next.replay = payload ?? null;
      break;
    case "MUTE_ROLE":
      next.muted_roles = Array.from(new Set([...(state.muted_roles ?? []), payload].filter(Boolean)));
      break;
    case "UNMUTE_ROLE":
      next.muted_roles = (state.muted_roles ?? []).filter((r) => r !== payload);
      break;
    default:
      return res.status(400).json({ error: `Unsupported action: ${type}` });
  }

  // validate against schema
  const valid = validateAgainstSchema(OP_SCHEMA, next);
  if (!valid) {
    return res.status(422).json({ error: "Schema validation failed for overrides.json" });
  }

  // persist + ledger
  writeOverrides(next);
  ledgerOperatorAction({ action_type: type, payload: payload ?? null });

  res.json({ ok: true, overrides: next });
});

export function startOperatorApi(port = 3100) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🎛️  Operator API listening on :${port}`);
      resolve(server);
    });
  });
}

export default app;
