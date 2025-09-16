import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DemoBroadcast from "./pages/DemoBroadcast";
import StudioDashboard from "./pages/StudioDashboard";
import SUCDaily from "./pages/SUCDaily";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/studio" replace />} />
        <Route path="/demo" element={<DemoBroadcast />} />
        <Route path="/studio" element={<StudioDashboard />} />
        <Route path="/daily" element={<SUCDaily />} />
      </Routes>
    </Router>
  );
}
