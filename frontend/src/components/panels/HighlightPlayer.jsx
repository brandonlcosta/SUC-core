import usePollingJson from "../../hooks/usePollingJson";
import { useState } from "react";

export default function HighlightPlayer({ url = "/outputs/broadcast/overlays.json" }) {
  const data = usePollingJson(url, 5000);
  const [current, setCurrent] = useState(0);

  if (!data) return <div className="p-4 bg-white rounded-2xl shadow">Loading highlights...</div>;

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="p-4 bg-white rounded-2xl shadow">No highlights yet...</div>;
  }

  const highlight = data[current];
  const nextHighlight = () => setCurrent((prev) => (prev + 1) % data.length);

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="aspect-video bg-gray-800 flex items-center justify-center text-white">
        {highlight.type === "video" ? (
          <video
            key={highlight.src}
            src={highlight.src}
            controls
            autoPlay
            className="w-full h-full object-contain"
            onEnded={nextHighlight}
          />
        ) : highlight.type === "image" ? (
          <img
            key={highlight.src}
            src={highlight.src}
            alt={highlight.caption || "Highlight"}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="p-4">{highlight.text || highlight.caption || "Unknown highlight"}</div>
        )}
      </div>
      {highlight.caption && (
        <div className="bg-gray-900 text-white p-2 text-sm text-center">
          {highlight.caption}
        </div>
      )}
    </div>
  );
}