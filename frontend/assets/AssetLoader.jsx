// File: frontend/assets/AssetLoader.jsx
import React, { useEffect, useState } from "react";

/**
 * AssetLoader:
 * Resolves runner avatars, props, or environments from assets.json.
 * Uses /public/assets/assets.json for manifest lookups.
 * Falls back to placeholder if not found.
 */
export default function AssetLoader({ id, size = 48 }) {
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    fetch("/assets/assets.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load assets.json");
        return res.json();
      })
      .then((data) => {
        const found = data.find((a) => a.id === id);
        setAsset(found || null);
      })
      .catch(() => setAsset(null));
  }, [id]);

  if (!asset) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-gray-700 flex items-center justify-center rounded-full text-xs text-white"
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={asset.thumbnail_url || "/assets/placeholder.png"}
      alt={asset.id}
      width={size}
      height={size}
      className="rounded-full border border-gray-500 object-cover"
    />
  );
}
