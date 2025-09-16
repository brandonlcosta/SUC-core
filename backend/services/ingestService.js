// /backend/services/ingestService.js
// Collects raw events from adapters and validates against event schema

import { validateAgainstSchema } from "../utils/schemaValidator.js";
import stravaAdapter from "../adapters/stravaAdapter.js";
import raceScraperAdapter from "../adapters/raceScraperAdapter.js";
import esportsAdapter from "../adapters/esportsAdapter.js";
import path from "path";

const EVENT_SCHEMA_PATH = path.resolve("./backend/schemas/event.schema.json");

/**
 * Run ingest service: poll adapters and normalize raw events
 * @returns {Promise<Array<Object>>} events
 */
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

  try {
    const esportsEvents = await esportsAdapter.fetch();
    events.push(...esportsEvents);
  } catch (err) {
    console.error("❌ Esports adapter failed", err);
  }

  // Validate events against schema
  const validEvents = events.filter((e) => validateAgainstSchema(EVENT_SCHEMA_PATH, e));

  return validEvents;
}

export default runIngestService;
