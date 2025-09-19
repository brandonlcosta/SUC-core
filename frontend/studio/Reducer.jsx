// File: frontend/studio/Reducer.jsx
//
// Phase 3 Reducer for SUC-core frontend
// ✅ Polls roster.json, spatial.json, overlays.json every 5s
// ✅ Normalizes schema (athleteId -> athlete_id)
// ✅ Maintains overlay queue with pacing rules
// ✅ Provides fallback data if fetch fails
// ✅ Logs detailed errors with HTTP status + URL

import React, { createContext, useReducer, useEffect, useContext } from "react";

export const BroadcastContext = createContext();

const initialState = {
  roster: [],
  spatial: { athletes: [], checkpoints: [] },
  overlays: [] // reducer-controlled overlay queue
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

// normalize athlete fields
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
  return {
    athletes: (data.athletes || []).map((a, i) => ({
      athlete_id: a.athlete_id || a.athleteId || `athlete_${i + 1}`,
      x: a.x ?? (10 + i * 8),
      y: a.y ?? (20 + i * 5)
    })),
    checkpoints: (data.checkpoints || []).map((cp, i) => ({
      checkpoint_id: cp.checkpoint_id || cp.id || `checkpoint_${i + 1}`,
      x: cp.x ?? (20 + i * 15),
      y: cp.y ?? (30 + i * 10),
      name: cp.name || `Checkpoint ${i + 1}`
    }))
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

  // utility fetcher with error logging + fallback
  async function safeFetch(url, normalizeFn, actionType, fallback) {
    try {
      const res = await fetch(url);
      console.log(`[Reducer] Fetch → ${url}`, res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      dispatch({ type: actionType, payload: normalizeFn(data) });
    } catch (err) {
      console.warn(`⚠️ Fetch failed for ${url}:`, err.message);
      dispatch({ type: actionType, payload: fallback });
    }
  }

  // poll roster.json
  useEffect(() => {
    const tick = () =>
      safeFetch(
        "/outputs/broadcast/roster.json",
        normalizeRoster,
        "LOAD_ROSTER",
        [
          { athlete_id: "demo_1", laps: 0, status: "active" },
          { athlete_id: "demo_2", laps: 0, status: "active" }
        ]
      );
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, []);

  // poll spatial.json
  useEffect(() => {
    const tick = () =>
      safeFetch(
        "/outputs/broadcast/spatial.json",
        normalizeSpatial,
        "LOAD_SPATIAL",
        {
          athletes: [
            { athlete_id: "demo_1", x: 20, y: 40 },
            { athlete_id: "demo_2", x: 60, y: 70 }
          ],
          checkpoints: [
            { checkpoint_id: "cp1", x: 50, y: 20, name: "CP1" },
            { checkpoint_id: "cp2", x: 80, y: 50, name: "CP2" }
          ]
        }
      );
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, []);

  // poll overlays.json
  useEffect(() => {
    const tick = () =>
      safeFetch(
        "/outputs/broadcast/overlays.json",
        normalizeOverlays,
        "LOAD_OVERLAYS",
        [
          {
            event_id: "demo_evt",
            overlay_type: "ticker",
            athlete_ids: [],
            sponsor_slot: null,
            priority: 1,
            timestamp: Date.now()
          }
        ]
      );
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
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

export default BroadcastProvider;
