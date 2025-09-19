// File: frontend/studio/BroadcastContext.jsx

import React, { useContext } from "react";
import BroadcastProvider, { BroadcastContext as InternalContext } from "./Reducer.jsx";

// --- Re-export for backward compatibility ---
export const BroadcastContext = InternalContext;

// --- Hook for easy access in panels ---
export function useBroadcast() {
  return useContext(BroadcastContext);
}

// --- Wrapper used at app root ---
export function BroadcastWrapper({ children }) {
  return <BroadcastProvider>{children}</BroadcastProvider>;
}
