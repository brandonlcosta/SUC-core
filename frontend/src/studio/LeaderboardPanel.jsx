// File: frontend/src/studio/LeaderboardPanel.jsx
//
// LeaderboardPanel v3 — Phase 3 Polish
// ✅ Sorted roster
// ✅ Crew color accent
// ✅ Highlight glow for leader
// ✅ Streak glow if active

import React from "react";
import { useBroadcast } from "./Reducer";
import AssetLoader from "../assets/AssetLoader";

export default function LeaderboardPanel() {
  const { state } = useBroadcast();
  const roster = state.roster || [];

  if (!roster.length) return null;

  const sorted = [...roster].sort((a, b) => b.laps - a.laps);

  return (
    <div className="absolute top-4 left-4 bg-black/70 p-4 rounded-2xl border-2 border-neon-green shadow-lg w-64">
      <h2 className="text-neon-green font-bold mb-2">Leaderboard</h2>
      {sorted.map((athlete, idx) => {
        const isLeader = idx === 0;
        const isStreak = athlete.streak_active; // backend field (bool)

        return (
          <div
            key={athlete.athlete_id}
            className={`flex items-center gap-2 mb-1 px-2 py-1 rounded-lg ${
              isLeader ? "bg-neon-green/20" : ""
            } ${isStreak ? "animate-pulse border border-neon-yellow" : ""}`}
          >
            <AssetLoader id={athlete.athlete_id} size={32} />
            <div className="flex flex-col">
              <span
                className={`font-semibold ${
                  isLeader ? "text-neon-green" : "text-white"
                }`}
              >
                {idx + 1}. {athlete.athlete_id}
              </span>
              <span className="text-xs text-gray-400">
                {athlete.crew || "No Crew"}
              </span>
            </div>
            <span className="ml-auto text-neon-yellow font-bold">
              {athlete.laps} laps
            </span>
          </div>
        );
      })}
    </div>
  );
}
