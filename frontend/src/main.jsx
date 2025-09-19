// File: frontend/src/main.jsx
//
// Entry point for SUC-core frontend
// ✅ Imports Mapbox CSS (fixes missing style warning)
// ✅ Wraps App in BroadcastProvider
// ✅ Loads Tailwind index.css

import "mapbox-gl/dist/mapbox-gl.css"; // required for Mapbox to render correctly
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./studio/App";
import { BroadcastProvider } from "./studio/Reducer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BroadcastProvider>
      <App />
    </BroadcastProvider>
  </React.StrictMode>
);
