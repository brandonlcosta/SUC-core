import recapExporter from "../backend/services/recapExporter.js";

const highlights = [
  { id: "h1", desc: "Runner A takes the lead on Lap 1" },
  { id: "h2", desc: "Photo finish at the halfway mark" }
];

const recap = {
  summary: "An electrifying head-to-head with nonstop action."
};

const pkg = recapExporter.exportWeekly(highlights, recap);
console.log("RecapExporter ✅ generated recap package:", pkg);
