// File: frontend/src/studio/TickerPanel.jsx
//
// TickerPanel v6 — ESPN SportsCenter Style
// ✅ Glossy ticker bar
// ✅ Flip/Roll animations
// ✅ Priority color cues
// ✅ Sponsor & avatars inline
// ✅ Always alive with dummy data

import React, { useEffect, useState } from "react";
import { useBroadcast } from "./Reducer";
import AssetLoader from "../assets/AssetLoader";

export default function TickerPanel() {
  const { state } = useBroadcast();
  const tickerEvents = state.groupedOverlays?.ticker || [];

  // Dummy fallback
  const items = tickerEvents.length
    ? tickerEvents
    : [
        {
          text: "🔥 Brandon takes the lead!",
          priority: 9,
          athlete_ids: ["runner_brandon"]
        },
        {
          text: "⚡ Emily sets a new PR!",
          priority: 8,
          athlete_ids: ["runner_emily"]
        },
        {
          text: "🎯 Rivalry intensifies between crews!",
          priority: 7,
          athlete_ids: ["runner_brandon", "runner_emily"]
        },
        {
          text: "🏆 Sponsor slot: Red Bull powers the arc!",
          priority: 5,
          sponsor_slot: "redbull"
        }
      ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000); // flip every 4s
    return () => clearInterval(id);
  }, [items]);

  const current = items[index];

  const getPriorityClass = (priority) => {
    if (priority >= 9) return "text-neon-pink";
    if (priority >= 7) return "text-neon-yellow";
    return "text-gray-200";
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t-4 border-red-600 shadow-2xl">
      <div className="flex items-center h-12 px-4 overflow-hidden">
        {/* Label left block */}
        <div className="bg-red-600 px-3 py-1 rounded-md shadow-md mr-4">
          <span className="text-white font-extrabold text-sm tracking-wide">
            LIVE
          </span>
        </div>

        {/* Flipping ticker text */}
        <div className="relative h-8 overflow-hidden flex-1">
          <div
            key={index}
            className={`absolute inset-0 flex items-center gap-2 text-lg font-bold transition-transform duration-700 transform animate-flip ${getPriorityClass(
              current.priority
            )}`}
          >
            {/* Avatars */}
            {current.athlete_ids &&
              current.athlete_ids.map((id) => (
                <AssetLoader key={id} id={id} size={24} />
              ))}

            {/* Event text */}
            {current.text}

            {/* Sponsor */}
            {current.sponsor_slot && (
              <img
                src={`/assets/sponsors/${current.sponsor_slot}.png`}
                alt={current.sponsor_slot}
                className="h-6 ml-2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
