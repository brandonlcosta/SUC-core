// File: frontend/studio/MapPanel.jsx

import React from "react";
import { useBroadcast } from "./BroadcastContext.jsx";

export default function MapPanel() {
  const { state } = useBroadcast();
  const { athletes = [], checkpoints = [] } = state.spatial || {};

  // fallback demo if no data
  if (!athletes.length && !checkpoints.length) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
        ⚠️ No spatial data — showing demo map
        <div className="absolute w-4 h-4 bg-suc-red rounded-full" style={{ left: "50%", top: "50%" }} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black">
      {/* Background map */}
      <div
        className="absolute inset-0 bg-cover opacity-30"
        style={{ backgroundImage: "url('/assets/envs/topo_dark.png')" }}
      ></div>

      {/* Checkpoints */}
      {checkpoints.map((cp, i) => (
        <div
          key={cp.checkpoint_id || cp.id || i}
          className="absolute rounded-full bg-suc-red/70 animate-pulse"
          style={{
            left: `${cp.x ?? (20 + i * 15)}%`,
            top: `${cp.y ?? (30 + i * 10)}%`,
            width: "24px",
            height: "24px",
            boxShadow: "0 0 12px 4px rgba(255,0,77,0.8)",
          }}
          title={cp.name || `Checkpoint ${i + 1}`}
        ></div>
      ))}

      {/* Athletes */}
      {athletes.map((athlete, i) => {
        const id = athlete.athlete_id || athlete.athleteId || `athlete_${i + 1}`;
        return (
          <div
            key={id}
            className="absolute rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]"
            style={{
              left: `${athlete.x ?? (10 + i * 8)}%`,
              top: `${athlete.y ?? (20 + i * 5)}%`,
              width: "16px",
              height: "16px",
            }}
            title={id}
          ></div>
        );
      })}
    </div>
  );
}
