// File: frontend/studio/SponsorPanel.jsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sponsorSlots from "@configs/sponsorSlots.json";

export default function SponsorPanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sponsorSlots.length);
    }, Math.floor(Math.random() * 30000) + 30000); // rotate every 30–60s
    return () => clearInterval(interval);
  }, []);

  const sponsor = sponsorSlots[activeIndex];

  return (
    <div className="absolute top-4 right-4 bg-gray-900/80 border border-neon rounded-2xl p-3 w-56">
      <AnimatePresence mode="wait">
        <motion.a
          key={sponsor.id}
          href={sponsor.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={sponsor.image}
            alt={sponsor.name}
            className="w-full h-24 object-contain mb-2"
          />
          <p className="text-white text-sm">{sponsor.description}</p>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
