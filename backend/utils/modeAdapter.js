// backend/utils/modeAdapter.js
// Thin adapter around modeLoader for engine consumption.
// Public API: getRulesets(), getPersonas(), getSponsorSlots(), getLayouts(), getBranding()

import { createModeLoader } from "../modeLoader.js";

const loader = createModeLoader();

export function getRulesets() {
  return loader.get("rulesets") || {};
}

export function getPersonas() {
  return loader.get("personas") || {};
}

export function getSponsorSlots() {
  return loader.get("sponsorSlots") || {};
}

export function getLayouts() {
  return loader.get("studioLayouts") || {};
}

export function getBranding() {
  return loader.get("branding") || {};
}

export function sources() {
  return loader.sources();
}

export default {
  getRulesets,
  getPersonas,
  getSponsorSlots,
  getLayouts,
  getBranding,
  sources,
};
