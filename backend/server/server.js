// File: backend/server/server.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Core services
import broadcastServer from "../services/broadcast.Server.js";
import liveServer from "../services/liveServer.js";
import rosterService from "../services/rosterService.js";
import recapExporter from "../services/recapExporter.js";
import sponsorMetrics from "../services/sponsorMetrics.js";
import geoService from "../services/geoService.js";
import ledgerService from "../services/Ledger.js";

// Engines (optional direct imports if needed)
import eventEngine from "../engines/eventEngine.js";
import scoringEngine from "../engines/scoringEngine.js";
import broadcastEngine from "../engines/broadcastEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ✅ Load sponsorSlots.json safely
const sponsorSlotsPath = path.resolve(__dirname, "../configs/sponsorSlots.json");
const sponsorSlots = JSON.parse(fs.readFileSync(sponsorSlotsPath, "utf-8"));

// -------------------
// API Routes
// -------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "✅ SUC Broadcast server running" });
});

// Sponsors API
app.get("/api/sponsors", (req, res) => {
  res.json(sponsorSlots);
});

// Roster API
app.get("/api/roster", (req, res) => {
  res.json(rosterService.getRoster());
});
app.post("/api/roster", (req, res) => {
  rosterService.setRoster(req.body);
  res.json({ ok: true });
});

// Recap API
app.post("/api/recap", (req, res) => {
  const { highlights, recap } = req.body;
  const pkg = recapExporter.exportWeekly(highlights, recap);
  res.json(pkg);
});

// Sponsor Metrics API
app.post("/api/sponsor/record", (req, res) => {
  const { sponsorId, slot, durationMs } = req.body;
  const record = sponsorMetrics.record(sponsorId, slot, durationMs);
  res.json(record);
});
app.get("/api/sponsor/aggregate", (req, res) => {
  res.json(sponsorMetrics.aggregate());
});

// Geo API
app.get("/api/geo", (req, res) => {
  res.json(geoService.getGeo());
});

// Ledger API (last ticks)
app.get("/api/ledger/ticks", async (req, res) => {
  const ticks = await ledgerService.last(20);
  res.json(ticks);
});

// -------------------
// Static Frontend
// -------------------
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
});

// -------------------
// Boot Services
// -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Express server listening on http://localhost:${PORT}`)
);

// Start WebSocket broadcast + live servers
broadcastServer.start();
liveServer.start();
