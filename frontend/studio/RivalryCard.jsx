// File: frontend/studio/RivalryCard.jsx

import React, { useEffect, useState } from "react";
import { useBroadcast } from "./BroadcastContext.jsx";
import assets from "../assets/assets.json";
import AssetLoader from "../assets/AssetLoader.jsx";

export default function RivalryCard() {
  const { state } = useBroadcast();
  const [rivalry, setRivalry] = useState(null);

  // Update when reducer pushes a rivalry overlay
  useEffect(() => {
    if (
      state.currentOverlay &&
      state.currentOverlay.overlay_type === "rivalry_card"
    ) {
      setRivalry(state.currentOverlay);
    }
  }, [state.currentOverlay]);

  if (!rivalry) return null; // No rivalry active

  const [athleteA, athleteB] = rivalry.athlete_ids || [];
  const assetA = assets.find((a) => a.id === athleteA);
  const assetB = assets.find((a) => a.id === athleteB);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] bg-black/80 text-white rounded-2xl shadow-2xl p-6 animate-slide-in">
      <h2 className="text-2xl font-bold text-suc-red mb-4">🔥 Rivalry Alert</h2>
      <div className="flex justify-between items-center">
        {/* Athlete A */}
        <div className="flex flex-col items-center">
          <AssetLoader asset={assetA} size={96} />
          <span className="mt-2 font-semibold">{athleteA}</span>
        </div>

        {/* VS */}
        <div className="text-4xl font-extrabold text-suc-red">VS</div>

        {/* Athlete B */}
        <div className="flex flex-col items-center">
          <AssetLoader asset={assetB} size={96} />
          <span className="mt-2 font-semibold">{athleteB}</span>
        </div>
      </div>
    </div>
  );
}
