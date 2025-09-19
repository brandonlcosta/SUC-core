// File: frontend/src/studio/Reducer.jsx
//
// Reducer v4 — GeoJSON-native
// ✅ roster.json stays array of athletes
// ✅ spatial.json must be GeoJSON FeatureCollection
// ✅ overlays.json stays array of overlay events

import React, { createContext, useReducer, useEffect, useContext } from "react";

export const BroadcastContext = createContext();

const initialState = {
  roster: [],
  spatial: { type: "FeatureCollection", features: [] },
  overlays: []
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_ROSTER":
      return { ...state, roster: action.payload };
    case "LOAD_SPATIAL":
      return { ...state, spatial: action.payload };
    case "LOAD_OVERLAYS":
      return { ...state, overlays: [...state.overlays, ...action.payload] };
    default:
      return state;
  }
}

function normalizeRoster(data = {}) {
  if (!data.athletes) return [];
  return data.athletes.map((a, i) => ({
    athlete_id: a.athlete_id || a.athleteId || `athlete_${i + 1}`,
    crew: a.crew || "N/A",
    laps: a.laps ?? 0,
    status: a.status || "unknown",
    lastSeen: a.lastSeen || null
  }));
}

function normalizeSpatial(data = {}) {
  // Must be valid GeoJSON
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data;
  }
  console.warn("⚠️ Invalid spatial.json, using fallback demo GeoJSON");

  // fallback demo GeoJSON
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.4, 37.8] },
        properties: { athlete_id: "demo_1" }
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.41, 37.81] },
        properties: { athlete_id: "demo_2" }
      }
    ]
  };
}

function normalizeOverlays(data = []) {
  return data.map((o, i) => ({
    event_id: o.event_id || `event_${i + 1}`,
    overlay_type: o.overlay_type || "ticker",
    athlete_ids: o.athlete_ids || [],
    sponsor_slot: o.sponsor_slot || null,
    priority: o.priority ?? 1,
    timestamp: o.timestamp || Date.now()
  }));
}

export function BroadcastProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function safeFetch(url, normalizeFn, actionType, fallback) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      dispatch({ type: actionType, payload: normalizeFn(data) });
    } catch {
      dispatch({ type: actionType, payload: fallback });
    }
  }

  // Poll roster.json
  useEffect(() => {
    const tick = () =>
      safeFetch("/outputs/broadcast/roster.json", normalizeRoster, "LOAD_ROSTER", []);
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  // Poll spatial.json (GeoJSON)
  useEffect(() => {
    const tick = () =>
      safeFetch(
        "/outputs/broadcast/spatial.json",
        normalizeSpatial,
        "LOAD_SPATIAL",
        { type: "FeatureCollection", features: [] }
      );
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  // Poll overlays.json
  useEffect(() => {
    const tick = () =>
      safeFetch("/outputs/broadcast/overlays.json", normalizeOverlays, "LOAD_OVERLAYS", []);
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <BroadcastContext.Provider value={{ state, dispatch }}>
      {children}
    </BroadcastContext.Provider>
  );
}

export function useBroadcast() {
  return useContext(BroadcastContext);
}
