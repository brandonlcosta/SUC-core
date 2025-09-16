// /backend/utils/schemaValidator.js
import Ajv2020 from "ajv/dist/2020.js";
import Ajv from "ajv"; // draft-07
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

const ajv2020 = new Ajv2020({ allErrors: true, strict: false });
const ajv07 = new Ajv({ allErrors: true, strict: false });

addFormats(ajv2020);
addFormats(ajv07);

const schemaCache = new Map();

/**
 * Load and compile a schema from disk (cached).
 * @param {string} schemaPath - path to schema file
 * @returns {Function} compiled validator
 */
function getValidator(schemaPath) {
  const absPath = path.resolve(schemaPath);

  if (schemaCache.has(absPath)) {
    return schemaCache.get(absPath);
  }

  const schemaRaw = fs.readFileSync(absPath, "utf-8");
  const schema = JSON.parse(schemaRaw);

  const engine =
    schema.$schema && schema.$schema.includes("draft-07") ? ajv07 : ajv2020;

  const validate = engine.compile(schema);
  schemaCache.set(absPath, validate);

  return validate;
}

/**
 * Validate an object against a JSON schema file.
 * @param {string} schemaPath - path to schema file
 * @param {Object} data - event object
 * @returns {boolean} valid
 */
export function validateSchema(schemaPath, data) {
  const validate = getValidator(schemaPath);
  const valid = validate(data);

  if (!valid) {
    console.error(
      `❌ Schema validation failed for ${schemaPath}`,
      JSON.stringify(validate.errors, null, 2)
    );
    validateSchema.errors = validate.errors;
  } else {
    validateSchema.errors = null;
  }

  return valid;
}
