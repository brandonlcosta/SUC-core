// File: frontend/studio/App.jsx

import React from "react";
import { BroadcastProvider } from "./BroadcastContext";
import LeaderboardPanel from "./LeaderboardPanel";
import OperatorConsole from "./OperatorConsole";
import MapPanel from "./MapPanel";
import RivalryCard from "./RivalryCard";
import ReplayOverlay from "./ReplayOverlay";
import TickerPanel from "./TickerPanel";
import { AnimatePresence } from "framer-motion";

const App = () => {
  return (
    <BroadcastProvider>
      <div className="relative min-h-screen bg-black text-white flex flex-col">
        {/* ===== Top Layer: Leaderboard + Rivalry + Ticker ===== */}
        <div className="h-[20%] grid grid-cols-12 gap-4 p-2">
          {/* Leaderboard on left */}
          <div className="col-span-3 flex items-start">
            <LeaderboardPanel />
          </div>

          {/* RivalryCard in the middle */}
          <div className="col-span-6 flex justify-center items-start">
            <RivalryCard />
          </div>

          {/* Empty right column for balance (can be sponsor ads later) */}
          <div className="col-span-3" />

          {/* Full-width ticker underneath */}
          <div className="col-span-12 mt-2">
            <TickerPanel />
          </div>
        </div>

        {/* ===== Middle Layer: Map ===== */}
        <div className="flex-grow h-[60%] flex justify-center items-center p-4">
          <MapPanel />
        </div>

        {/* ===== Bottom Layer: Operator Console ===== */}
        <div className="h-[20%] flex justify-end items-center p-4">
          <OperatorConsole />
        </div>

        {/* ===== Overlay Layer ===== */}
        <AnimatePresence>
          <ReplayOverlay />
        </AnimatePresence>
      </div>
    </BroadcastProvider>
  );
};

export default App;
