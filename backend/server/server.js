// File: backend/server/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Engines (fix import paths)
import eventEngine from "../engines/eventEngine.js";
import scoringEngine from "../engines/scoringEngine.js";
// ...add others as needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve frontend build
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
});

// Sponsors API (from backend/configs/sponsorSlots.json)
import sponsorSlots from "../configs/sponsorSlots.json" assert { type: "json" };
app.get("/api/sponsors", (req, res) => {
  res.json(sponsorSlots);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
