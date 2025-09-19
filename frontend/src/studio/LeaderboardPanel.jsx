// File: frontend/src/studio/LeaderboardPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import { useBroadcast } from "./Reducer";
import { motion, AnimatePresence } from "framer-motion";

const crewColors = {
  SUC: "text-pink-400",
  "Trail Blazers": "text-blue-400",
  "Iron Runners": "text-yellow-300",
  default: "text-gray-300"
};

export default function LeaderboardPanel({ compact = false }) {
  const { state } = useBroadcast();
  const [lastLaps, setLastLaps] = useState({});
  const prevLapsRef = useRef({});

  // Always define sorted + display
  const sorted = [...(state.roster || [])].sort((a, b) => {
    if (b.laps !== a.laps) return b.laps - a.laps;
    return (b.lastSeen || 0) - (a.lastSeen || 0);
  });
  const display = compact ? sorted.slice(0, 5) : sorted;

  // Detect lap changes without infinite loop
  useEffect(() => {
    let changes = {};
    let changed = false;

    sorted.forEach((a) => {
      const prev = prevLapsRef.current[a.athlete_id] ?? 0;
      if (a.laps > prev) {
        changes[a.athlete_id] = true;
        changed = true;
      }
      prevLapsRef.current[a.athlete_id] = a.laps;
    });

    // Only update state if there’s a real change
    if (changed) {
      setLastLaps((prev) => ({ ...prev, ...changes }));
    }
  }, [JSON.stringify(sorted.map((a) => ({ id: a.athlete_id, laps: a.laps })))]);

  if (display.length === 0) {
    return (
      <div className="absolute top-4 left-4 bg-gray-900/80 rounded-xl p-4 text-gray-400 italic">
        No athletes yet…
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 bg-gray-900/95 rounded-xl p-4 shadow-2xl border border-pink-500/50 w-72">
      <h2 className="text-pink-400 font-bold flex items-center mb-3">
        <span className="mr-2">🏆</span> Leaderboard
      </h2>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {display.map((athlete, idx) => {
            const color = crewColors[athlete.crew] || crewColors.default;
            const lapChanged = lastLaps[athlete.athlete_id];

            return (
              <motion.div
                key={athlete.athlete_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center bg-gray-800/80 rounded-md px-3 py-1.5"
              >
                <span className={`font-semibold ${color}`}>
                  #{idx + 1} {athlete.athlete_id}
                </span>
                <motion.span
                  key={athlete.laps}
                  initial={{ scale: 1 }}
                  animate={
                    lapChanged
                      ? { scale: [1.2, 1], color: ["#facc15", "#fef9c3"] }
                      : { scale: 1, color: "#facc15" }
                  }
                  transition={{ duration: 0.5 }}
                  className="font-bold text-yellow-400"
                >
                  {athlete.laps} {athlete.laps === 1 ? "lap" : "laps"}
                </motion.span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
