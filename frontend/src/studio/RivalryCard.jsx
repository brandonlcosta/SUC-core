// File: frontend/src/studio/RivalryCard.jsx

import React from "react";
import { useBroadcast } from "./Reducer";

export default function RivalryCard() {
  const { state } = useBroadcast();

  // ✅ FIX: spelling corrected
  const rivalry = state.overlays.find(o => o.overlay_type === "rivalry_card");
  if (!rivalry) return null;

  const [a1, a2] = rivalry.athlete_ids || [];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900/95 rounded-3xl p-6 flex flex-col items-center shadow-2xl border border-pink-500/50">
        <h2 className="mb-4">🔥 Rivalry</h2>
        <div className="flex gap-8 items-center">
          <div className="text-white text-lg font-bold">{a1}</div>
          <div className="text-pink-500 font-extrabold text-3xl">VS</div>
          <div className="text-white text-lg font-bold">{a2}</div>
        </div>
        {rivalry.sponsor_slot && (
          <div className="mt-4 text-sm text-gray-400">
            Presented by {rivalry.sponsor_slot}
          </div>
        )}
      </div>
    </div>
  );
}
