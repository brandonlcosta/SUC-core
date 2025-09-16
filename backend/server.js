import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// ✅ Allow cross-origin requests from frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Serve static JSON and geo data
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}\n`);

  const base = `http://localhost:${port}/outputs/broadcast`;

  console.log("📡 Available broadcast endpoints:");
  console.log(`   🏃 Leaderboard:   ${base}/leaderboard.json`);
  console.log(`   🗺️ Spatial Map:   ${base}/spatial.json`);
  console.log(`   📰 Ticker:        ${base}/ticker.json`);
  console.log(`   📖 Stories:       ${base}/stories.json`);
  console.log(`   📊 Context:       ${base}/meta.json`);
  console.log(`   🎬 Recap:         ${base}/recap.json`);
  console.log(`   🌟 Highlights:    ${base}/overlays.json`);
  console.log(`   📅 Daily:         ${base}/daily.json\n`);

  console.log("✅ Server is ready. Open one of the URLs above in your browser to test.");
});
