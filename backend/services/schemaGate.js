// File: backend/services/schemaGate.js

import fs from "fs";
import path from "path";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

/**
 * Validate output against a schema by name
 * @param {string} schemaName - base name of schema file (e.g. "recap", "broadcastTick")
 * @param {object} data - JSON data to validate
 */
export function validate(schemaName, data) {
  const schemaPath = path.resolve(
    "./backend/schemas",
    `${schemaName}.schema.json`
  );

  if (!fs.existsSync(schemaPath)) {
    console.warn(`[schemaGate] No schema found for ${schemaName}, skipping validation`);
    return true;
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const validateFn = ajv.compile(schema);

  const valid = validateFn(data);
  if (!valid) {
    console.error(`[schemaGate] Validation failed for ${schemaName}:`);
    console.error(validateFn.errors);
    throw new Error(`Schema validation failed for ${schemaName}`);
  }

  return true;
}

/**
 * Bulk validator for all known schemas (for harness testing)
 */
export function validateAll(ctx) {
  const checks = [
    ["broadcastTick", ctx.broadcast],
    ["recap", ctx.recap],
    ["daily", ctx.daily],
    ["roster", ctx.roster],
    ["scoring", ctx.scoring],
    ["story", ctx.story],
    ["meta", ctx.meta],
    ["spatial", ctx.spatial]
  ];

  checks.forEach(([schema, data]) => {
    if (data) validate(schema, data);
  });
}
