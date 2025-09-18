// File: backend/server/server.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Engines (import as needed)
import eventEngine from "../engines/eventEngine.js";
import scoringEngine from "../engines/scoringEngine.js";
import broadcastEngine from "../engines/broadcastEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Load sponsorSlots.json using fs (avoids Node import issues)
const sponsorSlotsPath = path.resolve(__dirname, "../configs/sponsorSlots.json");
const sponsorSlots = JSON.parse(fs.readFileSync(sponsorSlotsPath, "utf-8"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "✅ SUC Broadcast server running" });
});

// Sponsors API
app.get("/api/sponsors", (req, res) => {
  res.json(sponsorSlots);
});

// Serve frontend build
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ SUC Broadcast server running at http://localhost:${PORT}`)
);
