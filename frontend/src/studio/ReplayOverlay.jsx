import React from "react";
import { useBroadcast } from "./Reducer";

export default function ReplayOverlay() {
  const { state } = useBroadcast();
  const replay = state.overlays.find(o => o.overlay_type === "replay");
  if (!replay) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900/95 rounded-3xl px-8 py-4 shadow-2xl border border-blue-500/50">
        <h2 className="text-3xl font-extrabold text-blue-400">
          🎬 Replay {replay.sponsor_slot && ` — Presented by ${replay.sponsor_slot}`}
        </h2>
      </div>
    </div>
  );
}
