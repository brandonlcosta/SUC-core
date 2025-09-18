// File: frontend/studio/StoryPanel.jsx

import React, { useContext } from "react";
import { BroadcastContext } from "./BroadcastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function StoryPanel() {
  const { state } = useContext(BroadcastContext);

  // Filter for story-type events coming from StoryEngine
  const arcs = state.events.filter((e) => e.overlay_type === "story_arc");

  if (!arcs.length) return null;

  // Show the most recent arc
  const latestArc = arcs[arcs.length - 1];

  return (
    <AnimatePresence>
      <motion.div
        key={latestArc.event_id}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[600px] bg-zinc-900/80 text-white rounded-2xl border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] p-4 z-40"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-purple-300 mb-2">
          {latestArc.arc_type?.toUpperCase() || "STORY"}
        </h3>
        <p className="text-lg">{latestArc.message}</p>
        <div className="text-sm opacity-70 mt-2">
          {new Date(latestArc.timestamp * 1000).toLocaleTimeString()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
