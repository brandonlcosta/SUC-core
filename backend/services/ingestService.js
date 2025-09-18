// File: backend/services/ingestService.js
// Collects raw events from adapters and validates against event schema

import { validateAgainstSchema } from "../utils/schemaValidator.js";
import stravaAdapter from "../adapters/stravaAdapter.js";
import raceScraperAdapter from "../adapters/raceScraperAdapter.js";
import path from "path";

const EVENT_SCHEMA_PATH = path.resolve("./backend/schemas/event.schema.json");

export async function runIngestService() {
  const events = [];

  try {
    const stravaEvents = await stravaAdapter.fetch();
    events.push(...stravaEvents);
  } catch (err) {
    console.error("❌ Strava adapter failed", err);
  }

  try {
    const raceEvents = await raceScraperAdapter.fetch();
    events.push(...raceEvents);
  } catch (err) {
    console.error("❌ RaceScraper adapter failed", err);
  }

  // Validate against schema
  const validEvents = events.filter((event) =>
    validateAgainstSchema(EVENT_SCHEMA_PATH, event)
  );

  return validEvents;
}

// Service wrapper class
export class IngestService {
  async poll() {
    return await runIngestService();
  }
}

// Default singleton instance
const ingestService = new IngestService();
export default ingestService;
