// File: frontend/studio/StoryPanel.jsx

import React, { useEffect, useState } from "react";
import { useBroadcast } from "./BroadcastContext.jsx";

export default function StoryPanel() {
  const { state } = useBroadcast();
  const [arc, setArc] = useState(null);

  // Watch reducer for story arcs
  useEffect(() => {
    if (
      state.currentOverlay &&
      state.currentOverlay.overlay_type === "story_arc"
    ) {
      setArc(state.currentOverlay);
    }
  }, [state.currentOverlay]);

  if (!arc) return null; // no active story arc

  return (
    <div className="absolute top-20 right-4 w-72 bg-black/70 text-white rounded-xl shadow-md p-4 animate-glitch-in">
      <h3 className="text-lg font-bold text-suc-red mb-2">📖 Story Arc</h3>
      <p className="text-sm">{arc.description || "New rivalry emerging..."}</p>
    </div>
  );
}
