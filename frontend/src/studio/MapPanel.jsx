// File: frontend/src/studio/MapPanel.jsx

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useBroadcast } from "./Reducer";
import AssetLoader from "../assets/AssetLoader";

mapboxgl.accessToken ="pk.eyJ1Ijoic2FjdWx0cmFjcmV3IiwiYSI6ImNtZjd0Z2ZidjBmcWwybXEyZWZkcGxsbDIifQ.Cpqbw4SxlvmJjtOct5RLDg";

export default function MapPanel() {
  const { state } = useBroadcast();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-122.4, 37.8],
        zoom: 12
      });

      mapRef.current.on("load", () => {
        mapRef.current.addSource("athletes", {
          type: "geojson",
          data: state.spatial
        });
        mapRef.current.addLayer({
          id: "athlete-points",
          type: "circle",
          source: "athletes",
          paint: {
            "circle-radius": 6,
            "circle-color": "#ff1aff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff"
          }
        });
      });
    } else {
      const src = mapRef.current.getSource("athletes");
      if (src) src.setData(state.spatial);
    }
  }, [state.spatial]);

  return (
    <div className="w-full h-full relative">
      <div id="map" className="w-full h-full" />
      {/* Overlay avatars on top */}
      {state.spatial.features
        .filter((f) => f.geometry.type === "Point")
        .map((f, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{
              left: `${50 + idx * 40}px`,
              bottom: "20px"
            }}
          >
            <AssetLoader id={f.properties.athlete_id} size={40} />
          </div>
        ))}
    </div>
  );
}
