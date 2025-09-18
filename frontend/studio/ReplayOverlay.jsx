// File: frontend/studio/ReplayOverlay.jsx

import { motion, AnimatePresence } from "framer-motion";
import sponsorSlots from "@configs/sponsorSlots.json";

export default function ReplayOverlay({ isActive }) {
  const activeSponsor = sponsorSlots[0]; // default rotation or backend injection

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-full h-full">
            <div className="absolute bottom-8 right-8 bg-black/70 p-3 rounded-lg border border-neon">
              <img
                src={activeSponsor.image}
                alt={activeSponsor.id}
                className="h-10 inline-block mr-2"
              />
              <p className="text-white text-sm inline-block">
                Replay brought to you by {activeSponsor.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
