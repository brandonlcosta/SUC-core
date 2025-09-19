// File: frontend/src/studio/MapPanel.jsx
//
// MapPanel v3 — GeoJSON-native
// ✅ Uses Mapbox Source with FeatureCollection
// ✅ Shows athletes as circle layer
// ✅ Ready for checkpoints + polygons later

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useBroadcast } from "./Reducer";

mapboxgl.accessToken ="pk.eyJ1Ijoic2FjdWx0cmFjcmV3IiwiYSI6ImNtZjd0Z2ZidjBmcWwybXEyZWZkcGxsbDIifQ.Cpqbw4SxlvmJjtOct5RLDg"
;

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
    }

    const map = mapRef.current;

    // add data source or update
    if (map.getSource("athletes")) {
      map.getSource("athletes").setData(state.spatial);
    } else {
      map.on("load", () => {
        map.addSource("athletes", {
          type: "geojson",
          data: state.spatial
        });
        map.addLayer({
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
    }
  }, [state.spatial]);

  return <div id="map" className="w-full h-full" />;
}
