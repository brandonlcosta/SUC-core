// File: frontend/studio/LeaderboardPanel.jsx

import React from "react";
import { useBroadcast } from "./BroadcastContext.jsx";

export default function LeaderboardPanel() {
  const { state } = useBroadcast();
  const roster = state.roster || [];

  if (!roster.length) {
    return (
      <div className="p-4 bg-black text-white text-lg">
        ⚠️ No roster loaded — showing demo data
        <ul>
          <li>Runner 1 — 0 laps</li>
          <li>Runner 2 — 0 laps</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 w-80 bg-black/70 text-white rounded-2xl shadow-lg p-4 neon-border">
      <h2 className="text-xl font-bold mb-2 text-suc-red">Leaderboard</h2>
      <ul>
        {roster.map((athlete, i) => (
          <li
            key={athlete.athleteId || i}
            className="flex items-center justify-between border-b border-gray-700 py-2"
          >
            <span className="font-semibold">
              {athlete.athleteId || `Athlete ${i + 1}`}
            </span>
            <span className="text-suc-red">{athlete.laps ?? 0} laps</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
