// File: frontend/studio/index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Global HUD styling (glitch animations, neon filters)
import "tailwindcss/tailwind.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
