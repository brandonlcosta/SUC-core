// File: frontend/tests/visualHarness.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ReducerProvider, useReducerState } from "../studio/Reducer.jsx";
import App from "../studio/App.jsx";

/**
 * HarnessDriver simulates broadcast ticks so we can see
 * LeaderboardPanel, MapPanel, RivalryCard, and TickerPanel update live.
 */
function HarnessDriver() {
  const { dispatch } = useReducerState();

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;

      // Build a fake broadcast tick
      let fakeTick = {
        event_id: `demo_${tick}`,
        session_id: tick % 2 === 0 ? "backyard_day1" : "marathon_day1",
        overlay_type: "lap_complete",
        athlete_ids: ["runner_brandon"],
        asset_ids: ["runner_brandon_v1"],
        environment_id: tick % 2 === 0 ? "backyard_loop_v1" : "marathon_aidstation_v1",
        prop_ids: tick % 4 === 0 ? ["cooler_suc"] : [],
        sponsor_slot: tick % 3 === 0 ? "redbull_banner" : "skratch_banner",
        priority: 5,
        timestamp: Date.now()
      };

      // Inject rivalry overlay every 5th tick
      if (tick % 5 === 0) {
        fakeTick.overlay_type = "rivalry_card";
        fakeTick.athlete_ids = ["runner_brandon", "runner_emily"];
      }

      // Inject replay overlay every 7th tick
      if (tick % 7 === 0) {
        fakeTick.overlay_type = "replay";
      }

      // Dispatch into reducer
      dispatch({ type: "TICK_RECEIVED", tick: fakeTick });
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return <App />;
}

function VisualHarness() {
  return (
    <ReducerProvider>
      <HarnessDriver />
    </ReducerProvider>
  );
}

// If you want to run this harness standalone with Vite:
if (document.getElementById("root")) {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <VisualHarness />
    </React.StrictMode>
  );
}

export default VisualHarness;
