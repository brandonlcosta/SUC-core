// File: frontend/studio/BroadcastContext.jsx

import React, { createContext, useReducer, useContext, useEffect } from "react";
import Reducer, { initialState } from "./Reducer";

// Create the context
const BroadcastContext = createContext();

export const BroadcastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);

  // Bootstrap from VITE_FEEDS (passed by backend/start-all.js)
  useEffect(() => {
    try {
      const feeds = JSON.parse(import.meta.env.VITE_FEEDS || "{}");
      if (feeds.athletes) {
        dispatch({ type: "INIT_FEEDS", payload: feeds });
      }
    } catch (e) {
      console.warn("⚠️ No bootstrap feeds available");
    }
  }, []);

  return (
    <BroadcastContext.Provider value={{ state, dispatch }}>
      {children}
    </BroadcastContext.Provider>
  );
};

// Hook for convenience
export const useBroadcast = () => useContext(BroadcastContext);

// Export both named and default for compatibility
export { BroadcastContext };
export default BroadcastContext;
