// utils/schemaValidator.js
// Ajv2020 + JSONC-tolerant loader.

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

function parseJSONC(text) {
  let s = text.replace(/^\uFEFF/, "");
  s = s.replace(/^\s*\/\/.*$/gm, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(s);
}

let validateEventFn = null;

export function validateEvent(event, schemaPath = "schemas/event.schema.json") {
  if (!validateEventFn) {
    const raw = fs.readFileSync(schemaPath, "utf8");
    const schema = parseJSONC(raw);
    validateEventFn = ajv.compile(schema);
  }
  return validateEventFn(event);
}

export function validateSignal(_) { return true; }
export function validateBroadcast(_) { return true; }

export default { validateEvent, validateSignal, validateBroadcast };
