// File: frontend/studio/App.jsx

import React from "react";
import { BroadcastWrapper } from "./BroadcastContext.jsx";
import LeaderboardPanel from "./LeaderboardPanel.jsx";
import RivalryCard from "./RivalryCard.jsx";
import SponsorPanel from "./SponsorPanel.jsx";
import TickerPanel from "./TickerPanel.jsx";
import MapPanel from "./MapPanel.jsx";
import ReplayOverlay from "./ReplayOverlay.jsx";
import StoryPanel from "./StoryPanel.jsx";
import OperatorConsole from "./OperatorConsole.jsx";

export default function App() {
  return (
    <BroadcastWrapper>
      <div className="w-screen h-screen bg-black text-white font-bold">
        {/* Panels driven by reducer state */}
        <LeaderboardPanel />
        <RivalryCard />
        <SponsorPanel />
        <TickerPanel />
        <MapPanel />
        <ReplayOverlay />
        <StoryPanel />
        <OperatorConsole />
      </div>
    </BroadcastWrapper>
  );
}
