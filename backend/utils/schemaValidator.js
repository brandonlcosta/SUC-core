// File: backend/utils/schemaValidator.js
// AJV 2020 with formats, caching, and full meta-schema support.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";

const _cache = new Map();

function _getAjv() {
  // validateSchema defaults to true here (meta-schema checked)
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true
  });
  addFormats(ajv);
  return ajv;
}

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
        .map(e => `${e.instancePath || "/"} ${e.message}`)
        .join("; ");
      console.error(`Schema validation failed (${schemaPath}): ${errs}`);
    }
    return ok;
  } catch (e) {
    console.error(`Schema validate error for ${schemaPath}:`, e?.message || e);
    return false;
  }
}
