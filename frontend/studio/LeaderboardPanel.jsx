// File: frontend/studio/LeaderboardPanel.jsx

import React from "react";
import { useBroadcast } from "./BroadcastContext";
import AssetLoader from "../assets/AssetLoader";

const LeaderboardPanel = () => {
  const { state } = useBroadcast();

  // Bootstrap athletes from initial feeds (passed via VITE_FEEDS)
  const athletes = state.athletes || [];

  if (!athletes.length) {
    return (
      <div className="p-4 text-center text-gray-400">
        Waiting for athletes...
      </div>
    );
  }

  return (
    <div className="p-4 bg-black bg-opacity-70 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-neon mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {athletes
          .sort((a, b) => b.laps - a.laps)
          .map((athlete) => (
            <li
              key={athlete.athlete_id}
              className="flex items-center justify-between p-2 bg-gray-900 rounded-xl border border-gray-700 hover:bg-gray-800"
            >
              {/* Avatar thumbnail via AssetLoader */}
              <div className="flex items-center space-x-3">
                <AssetLoader id={athlete.athlete_id} className="w-8 h-8" />
                <span className="text-white font-semibold">{athlete.name}</span>
                <span className="text-sm text-gray-400">({athlete.crew})</span>
              </div>

              {/* Lap count + streak indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-neon font-bold">{athlete.laps} laps</span>
                {athlete.tier === "vip" && (
                  <span className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                    VIP
                  </span>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default LeaderboardPanel;
