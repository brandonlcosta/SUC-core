import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export class SchemaGate {
  constructor(schemaDir = path.join(process.cwd(), "backend/schemas")) {
    this.schemaDir = schemaDir;
    this.cache = {};
  }

  loadSchema(name) {
    if (!this.cache[name]) {
      const schemaPath = path.join(this.schemaDir, `${name}.schema.json`);
      const raw = fs.readFileSync(schemaPath, "utf-8");
      this.cache[name] = JSON.parse(raw);
      ajv.addSchema(this.cache[name], name);
    }
    return this.cache[name];
  }

  validate(name, data) {
    this.loadSchema(name);
    const validate = ajv.getSchema(name);
    if (!validate(data)) {
      const errors = validate.errors
        ?.map(e => `${e.instancePath} ${e.message}`)
        .join(", ");
      throw new Error(`Schema validation failed for ${name}: ${errors}`);
    }
    return true;
  }
}

export default new SchemaGate();
