// File: frontend/src/studio/OperatorConsole.jsx
//
// OperatorConsole v2 — Production Cockpit
// ✅ Toggle panels on/off
// ✅ Trigger replay sequences
// ✅ Inject sponsor slot
// ✅ Pin/unpin story arcs
// ✅ Mute commentary personas
// ✅ Rollback last overlay
// Reducer-driven: dispatches actions to Reducer.js

import React from "react";
import { useBroadcast } from "./Reducer";

export default function OperatorConsole() {
  const { state, dispatch } = useBroadcast();

  // Panels list (driven by panels.json ideally)
  const panels = ["leaderboard", "ticker", "map", "story", "rivalry", "replay"];

  return (
    <div className="fixed bottom-0 right-0 w-80 bg-black/90 text-white p-4 border-t-4 border-l-4 border-neon-red z-50">
      <h2 className="text-lg font-bold mb-2 text-neon-yellow">Operator Console</h2>

      {/* Panel Toggles */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Panels</h3>
        {panels.map((p) => (
          <button
            key={p}
            onClick={() => dispatch({ type: "TOGGLE_PANEL", panel: p })}
            className={`w-full mb-1 py-1 rounded text-sm ${
              state.activePanels?.includes(p)
                ? "bg-neon-green"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Replay Trigger */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Replay</h3>
        <button
          onClick={() => dispatch({ type: "TRIGGER_REPLAY" })}
          className="w-full py-1 bg-neon-pink hover:bg-neon-red rounded text-sm"
        >
          Trigger Replay
        </button>
      </div>

      {/* Sponsor Injection */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Sponsor</h3>
        <button
          onClick={() => dispatch({ type: "LOAD_SPONSOR_SLOT", slot: "default_checkpoint" })}
          className="w-full py-1 bg-neon-yellow text-black hover:bg-yellow-400 rounded text-sm"
        >
          Inject Sponsor Slot
        </button>
      </div>

      {/* Story Arc Controls */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Story Arcs</h3>
        <button
          onClick={() => dispatch({ type: "PIN_ARC" })}
          className="w-full py-1 bg-neon-blue hover:bg-blue-600 rounded text-sm mb-1"
        >
          Pin Arc
        </button>
        <button
          onClick={() => dispatch({ type: "UNPIN_ARC" })}
          className="w-full py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
        >
          Unpin Arc
        </button>
      </div>

      {/* Commentary Controls */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Commentary</h3>
        {["playByPlay", "analyst", "wildcard"].map((role) => (
          <button
            key={role}
            onClick={() => dispatch({ type: "MUTE_ROLE", role })}
            className="w-full mb-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Mute {role}
          </button>
        ))}
      </div>

      {/* Rollback */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Controls</h3>
        <button
          onClick={() => dispatch({ type: "ROLLBACK" })}
          className="w-full py-1 bg-red-700 hover:bg-red-600 rounded text-sm"
        >
          Rollback Last Overlay
        </button>
      </div>
    </div>
  );
}
