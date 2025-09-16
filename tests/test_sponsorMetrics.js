import sponsorMetrics from "../backend/services/sponsorMetrics.js";

// Record impressions
sponsorMetrics.record("nike", "hud_banner", 1000);
sponsorMetrics.record("nike", "hud_banner", 2000);
sponsorMetrics.record("adidas", "overlay_panel", 1500);

// Aggregate
const summary = sponsorMetrics.aggregate();
console.log("sponsorMetrics ✅ summary:", summary);
