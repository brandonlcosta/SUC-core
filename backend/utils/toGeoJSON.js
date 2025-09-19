// File: backend/utils/toGeoJSON.js

export function toGeoJSON(spatial) {
  const features = [];

  // athletes → Point Features
  for (const a of spatial.athletes || []) {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [a.x, a.y] },
      properties: { athlete_id: a.athlete_id }
    });
  }

  // checkpoints → Point Features
  for (const cp of spatial.checkpoints || []) {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [cp.x, cp.y] },
      properties: { checkpoint_id: cp.checkpoint_id, name: cp.name }
    });
  }

  return { type: "FeatureCollection", features };
}
