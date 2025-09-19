// File: frontend/index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./studio/App";
import "./index.css"; // Tailwind entry

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
