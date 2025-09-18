// File: backend/services/sponsorService.js

/**
 * Sponsor Service
 * Handles sponsor slot selection + rotation logic
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sponsorConfig = require("../configs/sponsorConfig.json");

let lastIndex = 0;
let lastTimestamp = 0;

/**
 * Pick the next sponsor slot
 * - Rotates through available sponsors
 * - Enforces frequency cap (seconds)
 * @returns {object|null} sponsorSlot
 */
export function pickSlot() {
  const now = Date.now();

  // Frequency cap
  if (now - lastTimestamp < sponsorConfig.frequency_cap_ms) {
    return null;
  }

  const sponsors = sponsorConfig.slots;
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  // Rotate index
  lastIndex = (lastIndex + 1) % sponsors.length;
  lastTimestamp = now;

  return sponsors[lastIndex];
}

/**
 * Reset sponsor rotation (used in tests/harness)
 */
export function resetSponsors() {
  lastIndex = 0;
  lastTimestamp = 0;
}
