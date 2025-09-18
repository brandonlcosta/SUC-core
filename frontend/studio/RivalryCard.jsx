// File: frontend/studio/RivalryCard.jsx

import React from "react";
import { useBroadcast } from "./BroadcastContext";
import AssetLoader from "../assets/AssetLoader";
import { motion, AnimatePresence } from "framer-motion";

const RivalryCard = () => {
  const { state } = useBroadcast();

  // Grab the most recent rivalry overlay event
  const rivalryEvent = [...state.overlays]
    .reverse()
    .find((o) => o.type === "rivalry_card");

  // If no rivalry event, render nothing
  if (!rivalryEvent) {
    return null;
  }

  const { athletes = [], rivalry = "Head-to-Head", sponsor } =
    rivalryEvent.data || {};

  return (
    <AnimatePresence>
      {rivalryEvent && (
        <motion.div
          key="rivalry-card"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-gray-900 bg-opacity-90 rounded-2xl shadow-lg text-white space-y-4"
        >
          <h2 className="text-xl font-bold text-neon text-center">{rivalry}</h2>

          <div className="flex justify-around items-center">
            {athletes.map((id) => (
              <div key={id} className="flex flex-col items-center space-y-2">
                <AssetLoader id={id} className="w-16 h-16" />
                <span className="font-semibold">{id}</span>
              </div>
            ))}
          </div>

          {sponsor && (
            <div className="text-xs text-gray-400 text-center mt-2">
              Sponsored by {sponsor}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RivalryCard;
