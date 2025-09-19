// File: frontend/src/studio/App.jsx
//
// SUC Studio App — Phase 3
// ✅ Central mount point for all panels
// ✅ Panels rendered conditionally via state.activePanels
// ✅ OperatorConsole always visible

import React from "react";
import { useBroadcast } from "./Reducer";

import LeaderboardPanel from "./LeaderboardPanel.jsx";
import TickerPanel from "./TickerPanel.jsx";
import MapPanel from "./MapPanel.jsx";
import StoryPanel from "./StoryPanel.jsx";
import RivalryCard from "./RivalryCard.jsx";
import ReplayOverlay from "./ReplayOverlay.jsx";
import OperatorConsole from "./OperatorConsole.jsx";

export default function App() {
  const { state } = useBroadcast();

  return (
    <div className="w-screen h-screen bg-black text-white overflow-hidden relative">
      {/* Core Panels */}
      {state.activePanels?.includes("leaderboard") && <LeaderboardPanel />}
      {state.activePanels?.includes("ticker") && <TickerPanel />}
      {state.activePanels?.includes("map") && <MapPanel />}
      {state.activePanels?.includes("story") && <StoryPanel />}
      {state.activePanels?.includes("rivalry") && <RivalryCard />}
      {state.activePanels?.includes("replay") && <ReplayOverlay />}

      {/* Operator console pinned in corner */}
      <OperatorConsole />
    </div>
  );
}
