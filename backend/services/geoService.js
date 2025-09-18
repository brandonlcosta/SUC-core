// File: backend/services/geoService.js

import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve(process.cwd(), "backend/outputs/broadcast");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "geo.json");

/**
 * GeoService
 * Converts athlete position ticks into GeoJSON trails
 */
export class GeoService {
  constructor() {
    this.positions = {}; // athlete_id → trail of coordinates
  }

  /**
   * Ingest athlete tick
   * @param {Object} tick - { athlete_id, coordinates [lng, lat], lap, timestamp }
   */
  addPosition(tick) {
    if (!this.positions[tick.athlete_id]) {
      this.positions[tick.athlete_id] = [];
    }
    this.positions[tick.athlete_id].push(tick);
    this.writeGeoJSON();
  }

  /**
   * Write current trails into GeoJSON file
   */
  writeGeoJSON() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const features = Object.values(this.positions)
      .flat()
      .map((pos) => ({
        type: "Feature",
        properties: {
          athlete_id: pos.athlete_id,
          lap: pos.lap,
          timestamp: pos.timestamp,
        },
        geometry: {
          type: "Point",
          coordinates: pos.coordinates,
        },
      }));

    const geoJSON = {
      type: "FeatureCollection",
      features,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(geoJSON, null, 2));
  }

  /**
   * Get current in-memory geo state
   */
  getGeo() {
    return this.positions;
  }
}

// Named helpers
export function addGeoPosition(tick) {
  return geoService.addPosition(tick);
}

export function getGeo() {
  return geoService.getGeo();
}

// Default singleton instance
const geoService = new GeoService();
export default geoService;
