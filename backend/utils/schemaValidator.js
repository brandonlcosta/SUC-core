// File: backend/utils/schemaValidator.js
// AJV 2020 with formats, caching, and full meta-schema support.

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";

const _cache = new Map();

function _getAjv() {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });
  addFormats(ajv);
  return ajv;
}

/**
 * Validate data against JSON schema
 * @param {string} schemaPath
 * @param {Object} data
 * @returns {boolean} validation result
 */
export function validateAgainstSchema(schemaPath, data) {
  try {
    let compiled = _cache.get(schemaPath);
    if (!compiled) {
      const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
      const ajv = _getAjv();
      compiled = ajv.compile(schema);
      _cache.set(schemaPath, compiled);
    }
    const ok = compiled(data);
    if (!ok) {
      const errs = (compiled.errors || [])
        .map((e) => `${e.instancePath || "/"} ${e.message}`)
        .join("; ");
      console.error(`Schema validation failed (${schemaPath}): ${errs}`);
    }
    return ok;
  } catch (e) {
    console.error(`Schema validate error for ${schemaPath}:`, e?.message || e);
    return false;
  }
}

// ✅ Default export for clean imports
export default {
  validateAgainstSchema,
};
