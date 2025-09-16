// /backend/engines/eventEngine.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateSchema } from "../utils/schemaValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path: backend/engines → ../schemas
const schemaPath = path.resolve(__dirname, "../schemas/event.schema.json");

let eventSchema;
try {
  eventSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  console.log(`✅ Loaded event schema from: ${schemaPath}`);
} catch (err) {
  throw new Error(
    `Failed to load event schema at ${schemaPath}: ${err.message}`
  );
}

export function normalizeEvent(rawEvent) {
  const normalized = { ...rawEvent };

  if (!normalized.meta) normalized.meta = {};
  if (!normalized.meta.ingested_at) {
    normalized.meta.ingested_at = new Date().toISOString();
  }

  if (!normalized.quality) {
    normalized.quality = {
      confidence: 0.0,
      priority: 0.0,
      trust_level: "projection"
    };
  }

  return normalized;
}

export function validateEvent(event) {
  const normalized = normalizeEvent(event);
  const valid = validateSchema(schemaPath, normalized);

  if (!valid) {
    throw new Error(
      `Event validation failed: ${JSON.stringify(
        validateSchema.errors,
        null,
        2
      )}`
    );
  }

  return normalized;
}

export function processEvents(events = []) {
  return events.map((e) => validateEvent(e));
}
