// /server.js
// Simple static server for SUC Broadcast

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve outputs (broadcast JSON files)
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Serve geojson routes
app.use("/geo", express.static(path.join(__dirname, "geo")));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "✅ SUC Broadcast server running" });
});

app.listen(PORT, () => {
  console.log(`✅ Broadcast backend running at http://localhost:${PORT}`);
});
