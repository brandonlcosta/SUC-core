// File: frontend/studio/OperatorConsole.jsx

import { useState } from "react";
import SponsorPanel from "@studio/SponsorPanel.jsx";
import TickerPanel from "@studio/TickerPanel.jsx";

export default function OperatorConsole() {
  const [tab, setTab] = useState("Play");

  return (
    <div className="h-screen w-full bg-gray-900 text-white">
      <div className="flex border-b border-neon">
        {["Play", "Watch", "Recap"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 ${
              tab === t ? "bg-neon text-black" : "hover:bg-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "Play" && <div>📋 Active demos/games listed here.</div>}
        {tab === "Watch" && (
          <div className="relative h-full">
            <SponsorPanel />
            <TickerPanel />
            {/* Other panels (Leaderboard, Map) plug in here */}
          </div>
        )}
        {tab === "Recap" && <div>🎬 Highlight player recap view here.</div>}
      </div>
    </div>
  );
}
