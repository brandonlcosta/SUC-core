import React from "react";
import { useBroadcast } from "./Reducer";
import { motion } from "framer-motion";

export default function TickerPanel() {
  const { state } = useBroadcast();
  const overlays = state.overlays || [];
  const messages = overlays.map(o => `${o.overlay_type.toUpperCase()} — ${o.event_id}`);

  return (
    <div className="overflow-hidden whitespace-nowrap bg-gray-900/80 h-full flex items-center px-4">
      <motion.div
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="text-pink-400 font-bold text-lg"
      >
        {messages.join("  •  ")}
      </motion.div>
    </div>
  );
}
