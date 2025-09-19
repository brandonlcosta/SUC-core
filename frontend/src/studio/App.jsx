// File: frontend/src/studio/App.jsx
//
// Main application shell
// ✅ Renders panels: Map, Leaderboard, Operator Console
// ✅ Uses Tailwind grid layout
// ✅ Modular broadcast-ready

import React from "react";
import MapPanel from "./MapPanel";
import LeaderboardPanel from "./LeaderboardPanel";
import OperatorConsole from "./OperatorConsole";
import TickerPanel from "./TickerPanel";

export default function App() {
  return (
    <div className="w-screen h-screen bg-gray-950 text-white overflow-hidden">
      {/* Main grid layout */}
      <div className="grid grid-cols-4 grid-rows-6 gap-2 w-full h-full p-2">
        {/* Map takes big central area */}
        <div className="col-span-3 row-span-6 relative rounded-xl overflow-hidden border border-gray-800 shadow-lg">
          <MapPanel />
        </div>

        {/* Right sidebar */}
        <div className="col-span-1 row-span-6 flex flex-col gap-2">
          <LeaderboardPanel />
          {/* Space reserved for RivalryCard or ReplayOverlay later */}
          <div className="flex-1 bg-gray-900/70 rounded-xl border border-gray-800 shadow-inner p-2">
            <p className="text-gray-500 italic text-sm">Overlays slot</p>
          </div>
          <OperatorConsole />
        </div>
      </div>

      {/* Bottom Ticker always on */}
      <div className="absolute bottom-0 left-0 right-0">
        <TickerPanel />
      </div>
    </div>
  );
}
