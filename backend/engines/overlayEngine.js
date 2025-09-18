// File: backend/engines/overlayEngine.js
// Reducer: builds polygons and heatmaps for map overlays

import fs from "fs";
import path from "path";
import { validateAgainstSchema } from "../utils/schemaValidator.js";

const OUTPUT_PATH = path.resolve("./outputs/broadcast/overlays.json");
const SCHEMA_PATH = path.resolve("./backend/schemas/mapOverlay.schema.json");

/**
 * Build overlay JSON from capture/zone events
 * @param {Array<Object>} events - capture/zone events with polygons
 * @returns {Object} overlays JSON
 */
export function overlayReducer(events = []) {
  const overlays = [];

  events.forEach((evt) => {
    if (evt.type === "zone" && evt.polygon) {
      overlays.push({
        id: evt.zoneId || `zone-${overlays.length}`,
        type: "zone",
        polygon: evt.polygon,
        properties: evt.properties || {},
      });
    }
    if (evt.type === "heatmap" && Array.isArray(evt.points)) {
      overlays.push({
        id: evt.heatmapId || `heatmap-${overlays.length}`,
        type: "heatmap",
        points: evt.points,
      });
    }
  });

  return { overlays };
}

/**
 * Run overlay engine and persist output
 * @param {Array<Object>} events
 * @returns {Object|null} overlays
 */
export function runOverlayEngine(events = []) {
  const overlays = overlayReducer(events);

  const valid = validateAgainstSchema(SCHEMA_PATH, overlays);
  if (!valid) {
    console.error("❌ OverlayEngine schema validation failed");
    return null;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(overlays, null, 2));
  console.log(`🗺️ OverlayEngine wrote ${OUTPUT_PATH}`);

  return overlays;
}

// ✅ Default export for server.js clean imports
export default {
  overlayReducer,
  runOverlayEngine,
};
