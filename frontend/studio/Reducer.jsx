// File: frontend/studio/Reducer.jsx

// Advanced Reducer with pacing, priority queues, overlays, sponsor slots

const initialState = {
  athletes: [],
  events: [],
  overlays: [],
  sponsors: [],
  positions: [],
  queue: [], // holds medium/low priority events
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT_FEEDS":
      return {
        ...state,
        athletes: action.payload.athletes || [],
        events: action.payload.events || [],
      };

    case "LAP_UPDATE":
      return {
        ...state,
        athletes: state.athletes.map((a) =>
          a.athlete_id === action.payload.athlete_id
            ? { ...a, laps: action.payload.laps }
            : a
        ),
        events: [...state.events, action.payload],
      };

    case "UPDATE_POSITIONS":
      return {
        ...state,
        positions: mergeGeoPositions(state.positions, action.payload),
      };

    case "QUEUE_EVENT": {
      const { priority, event } = action.payload;
      if (priority >= 8) {
        // high priority → instant overlay
        return {
          ...state,
          overlays: [...state.overlays, event],
        };
      } else {
        // medium/low → enqueue
        return {
          ...state,
          queue: [...state.queue, { priority, event }],
        };
      }
    }

    case "FLUSH_QUEUE": {
      // Push queued overlays into active list
      const sorted = [...state.queue].sort((a, b) => b.priority - a.priority);
      return {
        ...state,
        overlays: [...state.overlays, ...sorted.map((q) => q.event)],
        queue: [],
      };
    }

    case "SHOW_RIVALRY_CARD":
      return {
        ...state,
        overlays: [...state.overlays, { type: "rivalry_card", data: action.payload }],
      };

    case "TRIGGER_REPLAY":
      return {
        ...state,
        overlays: [...state.overlays, { type: "replay", data: action.payload }],
      };

    case "LOAD_SPONSOR_SLOT":
      return {
        ...state,
        sponsors: [...state.sponsors, action.payload],
      };

    case "RESET_OVERLAYS":
      return { ...state, overlays: [] };

    default:
      return state;
  }
}

export { initialState };
export default reducer;

// Helpers
function mergeGeoPositions(existing, incoming) {
  const map = new Map(existing.map((p) => [p.athlete_id, p]));
  incoming.forEach((pos) => {
    if (map.has(pos.athlete_id)) {
      const prev = map.get(pos.athlete_id);
      map.set(pos.athlete_id, {
        ...prev,
        trail: [...prev.trail, ...pos.trail],
      });
    } else {
      map.set(pos.athlete_id, pos);
    }
  });
  return Array.from(map.values());
}
