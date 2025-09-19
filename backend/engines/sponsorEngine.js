// File: backend/engines/sponsorEngine.js

import * as schemaGate from "../services/schemaGate.js";
import * as ledgerService from "../services/ledgerService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../configs/sponsorConfig.json");

// ✅ Safe defaults
let sponsorConfig = {
  default_sponsor: {
    sponsor_id: "sponsor_default",
    logo: "default_logo.png",
    message: "Powered by SUC-core",
    campaign: "default_campaign"
  }
};

if (fs.existsSync(configPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
    sponsorConfig = {
      default_sponsor: raw.default_sponsor || sponsorConfig.default_sponsor
    };
  } catch (err) {
    console.error("[sponsorEngine] Failed to load config, using defaults:", err);
  }
}

export function runSponsorEngine(events, state, ctx) {
  const sponsor = sponsorConfig.default_sponsor;

  const sponsorPayload = {
    sponsor_id: sponsor.sponsor_id,
    logo: sponsor.logo,
    message: sponsor.message,
    campaign: sponsor.campaign,
    timestamp: Date.now()
  };

  schemaGate.validate("sponsor", sponsorPayload);

  ledgerService.event({
    engine: "sponsor",
    type: "summary",
    payload: { sponsor_id: sponsorPayload.sponsor_id }
  });

  ctx.sponsor = sponsorPayload;
  return sponsorPayload;
}

export class SponsorEngine {
  run(events, state, ctx) {
    return runSponsorEngine(events, state, ctx);
  }
}

const sponsorEngine = new SponsorEngine();
export default sponsorEngine;
