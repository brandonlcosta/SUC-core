import sponsorExchange from "../backend/engines/sponsorExchange.js";

// Activate slot
sponsorExchange.activateSlot("adidas", "hud_banner", 2000);

try {
  sponsorExchange.tick(500);
  sponsorExchange.tick(500);
  console.log("sponsorExchange ✅ impressions logged");
} catch (err) {
  console.error("sponsorExchange ❌", err.message);
}

// Wait for expiry
setTimeout(() => {
  sponsorExchange.tick(500);
  console.log("Expired slots ✅ cleaned up");
}, 2500);
