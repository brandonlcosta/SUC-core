// File: frontend/src/studio/Reducer.jsx
//
// Reducer v6 — Config-Driven + Operator Actions
// ✅ roster.json stays array of athletes
// ✅ spatial.json must be GeoJSON FeatureCollection
// ✅ overlays.json stays array of overlay events
// ✅ broadcastConfig.json controls overlay sequencing & panels
// ✅ Handles OperatorConsole actions (toggle, replay, pin arc, mute, rollback)

import React, { createContext, useReducer, useEffect, useContext } from "react";

// Context for broadcast state
export const BroadcastContext = createContext();

const initialState = {
  roster: [],
  spatial: { type: "FeatureCollection", features: [] },
  overlays: [],
  groupedOverlays: {},
  activePanels: [],
  broadcastConfig: null
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_ROSTER":
      return { ...state, roster: action.payload };

    case "LOAD_SPATIAL":
      return { ...state, spatial: action.payload };

    case "LOAD_OVERLAYS": {
      const normalized = normalizeOverlays(action.payload);
      const overlays = applyBroadcastConfig(normalized, state.broadcastConfig);
      return {
        ...state,
        overlays,
        groupedOverlays: groupByPanel(overlays, state.broadcastConfig)
      };
    }

    case "LOAD_CONFIG":
      return {
        ...state,
        broadcastConfig: action.payload,
        activePanels: action.payload.panels || state.activePanels
      };

    // --- Operator Actions ---
    case "TOGGLE_PANEL":
      return {
        ...state,
        activePanels: state.activePanels.includes(action.panel)
          ? state.activePanels.filter((p) => p !== action.panel)
          : [...state.activePanels, action.panel]
      };

    case "TRIGGER_REPLAY": {
      const replay = {
        overlay_type: "replay",
        clip: "/clips/demo.mp4",
        sponsor: "Default Sponsor",
        timestamp: Date.now()
      };
      return {
        ...state,
        groupedOverlays: {
          ...state.groupedOverlays,
          replay: [replay]
        }
      };
    }

    case "LOAD_SPONSOR_SLOT": {
      const sponsor = {
        overlay_type: "sponsor",
        slot: action.slot,
        logo: "/sponsors/demo.png",
        timestamp: Date.now()
      };
      return {
        ...state,
        groupedOverlays: {
          ...state.groupedOverlays,
          sponsors: [sponsor]
        }
      };
    }

    case "PIN_ARC": {
      const pinned = {
        overlay_type: "story",
        type: "rivalry",
        title: "Pinned Rivalry Arc",
        timestamp: Date.now()
      };
      return {
        ...state,
        groupedOverlays: {
          ...state.groupedOverlays,
          story: [...(state.groupedOverlays.story || []), pinned]
        }
      };
    }

    case "UNPIN_ARC":
      return {
        ...state,
        groupedOverlays: { ...state.groupedOverlays, story: [] }
      };

    case "MUTE_ROLE":
      console.log(`Muted commentary role: ${action.role}`);
      return state;

    case "ROLLBACK":
      return { ...state, overlays: state.overlays.slice(0, -1) };

    default:
      return state;
  }
}

// --- Normalizers ---
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
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data;
  }
  console.warn("⚠️ Invalid spatial.json, using fallback demo GeoJSON");
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.4, 37.8] },
        properties: { athlete_id: "demo_1" }
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
    panel: o.panel || null,
    timestamp: o.timestamp || Date.now(),
    text: o.text || null,
    title: o.title || null,
    type: o.type || null
  }));
}

// --- Sequencing Helpers ---
function applyBroadcastConfig(overlays, config) {
  if (!config) return overlays;
  const { ticker_priority, reel_length } = config;

  return overlays
    .sort((a, b) => {
      const priA = ticker_priority.indexOf(a.overlay_type);
      const priB = ticker_priority.indexOf(b.overlay_type);
      return (priA === -1 ? Infinity : priA) - (priB === -1 ? Infinity : priB);
    })
    .slice(0, reel_length);
}

function groupByPanel(overlays, config) {
  if (!config) return {};
  const validPanels = config.panels || [];
  return overlays.reduce((acc, overlay) => {
    const panel = overlay.panel && validPanels.includes(overlay.panel)
      ? overlay.panel
      : overlay.overlay_type; // fallback: use overlay_type
    if (!acc[panel]) acc[panel] = [];
    acc[panel].push(overlay);
    return acc;
  }, {});
}

// --- Provider ---
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

  // Poll spatial.json
  useEffect(() => {
    const tick = () =>
      safeFetch("/outputs/broadcast/spatial.json", normalizeSpatial, "LOAD_SPATIAL", {
        type: "FeatureCollection",
        features: []
      });
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

  // Poll broadcastConfig.json
  useEffect(() => {
    const tick = () =>
      safeFetch(
        "/backend/configs/broadcastConfig.json",
        (data) => data,
        "LOAD_CONFIG",
        { ticker_priority: [], reel_length: 5, panels: [] }
      );
    tick();
    const id = setInterval(tick, 10000);
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
