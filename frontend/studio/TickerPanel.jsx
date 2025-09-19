// File: frontend/studio/TickerPanel.jsx

import React, { useEffect, useState } from "react";
import { useBroadcast } from "./BroadcastContext.jsx";

export default function TickerPanel() {
  const { state } = useBroadcast();
  const [lines, setLines] = useState([]);

  // Listen for ticker overlay events
  useEffect(() => {
    if (state.currentOverlay && state.currentOverlay.overlay_type === "ticker_line") {
      const newLine = {
        id: state.currentOverlay.event_id,
        text: state.currentOverlay.text || "Update incoming...",
      };
      setLines((prev) => [...prev.slice(-4), newLine]); // keep last 5 lines max
    }
  }, [state.currentOverlay]);

  if (!lines.length) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-black/80 border-t-2 border-suc-red overflow-hidden">
      <div className="ticker-track whitespace-nowrap animate-scroll flex gap-12 py-2 px-4">
        {lines.map((line) => (
          <span
            key={line.id}
            className="text-suc-red font-bold text-lg glitch-text"
          >
            {line.text}
          </span>
        ))}
      </div>
    </div>
  );
}
