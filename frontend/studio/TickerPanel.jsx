// File: frontend/studio/TickerPanel.jsx

import { useEffect, useState } from "react";
import sponsorSlots from "../configs/sponsorSlots.json";

export default function TickerPanel({ baseTicker = [] }) {
  const sponsorLines = sponsorSlots.map((s) => s.ticker);
  const [messages] = useState([...baseTicker, ...sponsorLines]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="w-full bg-gray-900 border-t border-neon py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <p className="text-white text-sm px-4">{messages[index]}</p>
      </div>
    </div>
  );
}
