// /backend/engines/spatialEngine.js
// Reducer: transforms normalized events with GPS into geoJSON paths

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/spatial.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/spatialEvent.schema.json");

/**
 * Build geoJSON FeatureCollection from GPS events
 * @param {Array<Object>} events - normalized events with GPS { athleteId, lat, lon, alt, timestamp }
 * @returns {Object} geoJSON FeatureCollection
 */
export function spatialReducer(events = []) {
  const features = [];
  const athletePaths = new Map();

  events.forEach((evt) => {
    if (!evt.athleteId || evt.lat === undefined || evt.lon === undefined) return;

    if (!athletePaths.has(evt.athleteId)) {
      athletePaths.set(evt.athleteId, []);
    }
    athletePaths.get(evt.athleteId).push([evt.lon, evt.lat, evt.alt || 0]);
  });

  athletePaths.forEach((coords, athleteId) => {
    features.push({
      type: "Feature",
      properties: { athleteId },
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    });
  });

  return { type: "FeatureCollection", features };
}

/**
 * Run spatial engine and persist output
 * @param {Array<Object>} events
 * @returns {Object} geoJSON FeatureCollection
 */
export function runSpatialEngine(events) {
  const spatial = spatialReducer(events);

  const valid = validateAgainstSchema(SCHEMA_PATH, spatial);
  if (!valid) {
    console.error("❌ SpatialEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(spatial, null, 2));
  console.log(`✅ SpatialEngine wrote ${OUTPUT_PATH}`);

  return spatial;
}

export default runSpatialEngine;
