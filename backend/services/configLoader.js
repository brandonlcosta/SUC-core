// File: backend/services/configLoader.js

import fs from "fs";
import path from "path";

/**
 * Loads a JSON config file from /backend/configs or /backend/rulesets.
 * Always parses into JS object; throws on failure.
 * 
 * @param {string} configName - file name, e.g. "metaConfig.json" or "backyardUltra.ruleset.json"
 * @param {"configs"|"rulesets"} [type="configs"] - directory where config resides
 * @returns {Object} Parsed JSON configuration
 */
export function loadConfig(configName, type = "configs") {
  const baseDir = path.resolve(`backend/${type}`);
  const filePath = path.join(baseDir, configName);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[ConfigLoader] Failed to load ${type}/${configName}:`, err.message);
    throw err;
  }
}
