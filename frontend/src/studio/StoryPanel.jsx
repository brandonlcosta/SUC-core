// File: frontend/src/studio/StoryPanel.jsx
//
// StoryPanel v1 — Narrative Arcs
// ✅ Reducer-driven (groupedOverlays["story"])
// ✅ Displays arcs: rivalry, comeback, underdog, dominance
// ✅ Esports banner style w/ neon pulse
// ✅ Operator can pin/unpin arcs via reducer

import React from "react";
import { useBroadcast } from "./Reducer";

export default function StoryPanel() {
  const { state } = useBroadcast();
  const arcs = state.groupedOverlays?.story || [];

  if (!arcs.length) return null;

  return (
    <div className="absolute top-4 w-full flex flex-col items-center z-50 pointer-events-none">
      {arcs.map((arc, idx) => (
        <div
          key={idx}
          className={`mb-2 px-6 py-3 rounded-2xl font-bold text-2xl tracking-wide text-white shadow-lg border-2 ${
            arc.type === "rivalry"
              ? "bg-neon-red border-white animate-pulse"
              : arc.type === "comeback"
              ? "bg-neon-yellow text-black animate-bounce"
              : arc.type === "dominance"
              ? "bg-neon-blue animate-pulse"
              : "bg-gray-800"
          }`}
        >
          {arc.title?.toUpperCase() || arc.type.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
