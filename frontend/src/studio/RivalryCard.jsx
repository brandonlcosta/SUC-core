// File: frontend/src/studio/RivalryCard.jsx

import React from "react";
import { useBroadcast } from "./Reducer";
import AssetLoader from "../assets/AssetLoader";

export default function RivalryCard() {
  const { state } = useBroadcast();
  const rivalries = state.groupedOverlays?.rivalry || [];

  if (!rivalries.length) return null;
  const card = rivalries[0];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl z-50 animate-slide-in">
      <div className="flex items-center justify-between bg-black/80 rounded-2xl border-4 border-neon-pink shadow-lg p-4">
        {/* Left Athlete */}
        <div className="flex flex-col items-center w-1/3">
          <AssetLoader id={card.athlete_ids[0]} size={96} />
          <span className="mt-2 text-white font-bold text-xl">
            {card.names?.[0] || card.athlete_ids[0]}
          </span>
          <span className="text-neon-yellow text-sm">{card.stats?.[0]}</span>
        </div>

        {/* VS + Sponsor */}
        <div className="flex flex-col items-center w-1/3">
          <span className="text-neon-pink text-3xl font-extrabold animate-pulse">VS</span>
          {card.sponsor && (
            <div className="mt-2 bg-black/70 px-4 py-1 rounded-lg border border-neon-yellow">
              <span className="text-white text-sm">
                Sponsored by {card.sponsor}
              </span>
            </div>
          )}
        </div>

        {/* Right Athlete */}
        <div className="flex flex-col items-center w-1/3">
          <AssetLoader id={card.athlete_ids[1]} size={96} />
          <span className="mt-2 text-white font-bold text-xl">
            {card.names?.[1] || card.athlete_ids[1]}
          </span>
          <span className="text-neon-yellow text-sm">{card.stats?.[1]}</span>
        </div>
      </div>
    </div>
  );
}
