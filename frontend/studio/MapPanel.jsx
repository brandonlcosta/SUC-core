// File: frontend/studio/MapPanel.jsx

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useBroadcast } from "./BroadcastContext";

// TODO: Replace with real Mapbox key
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "demo-mapbox-token";

const MapPanel = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const { state } = useBroadcast();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Init map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.4194, 37.7749], // San Francisco demo center
      zoom: 13,
    });

    // Add neon-like trail style
    mapRef.current.on("load", () => {
      mapRef.current.addSource("athletes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      mapRef.current.addLayer({
        id: "athlete-trails",
        type: "line",
        source: "athletes",
        paint: {
          "line-color": "#ff00ff", // neon pink
          "line-width": 4,
          "line-glow": 1.5,
        },
      });

      mapRef.current.addLayer({
        id: "athlete-points",
        type: "circle",
        source: "athletes",
        paint: {
          "circle-radius": 6,
          "circle-color": "#00ffff", // neon cyan
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
    });
  }, []);

  // Update trails whenever state changes
  useEffect(() => {
    if (!mapRef.current || !state.positions) return;

    const features = state.positions.map((pos) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: pos.trail,
      },
      properties: { athlete_id: pos.athlete_id },
    }));

    const src = mapRef.current.getSource("athletes");
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features,
      });
    }
  }, [state.positions]);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapPanel;
