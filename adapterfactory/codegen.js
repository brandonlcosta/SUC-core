// adapterFactory/codegen.js
// Hype OS Adapter Factory – codegen + harness
// Updated: Ajv2020 + JSONC-tolerant loader.

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

const readFile = (p) => fs.readFileSync(path.resolve(p), "utf8");
const parseJSONC = (text) => {
  let s = text.replace(/^\uFEFF/, "");
  s = s.replace(/^\s*\/\/.*$/gm, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(s);
};
const readJson = (p) => parseJSONC(readFile(p));

const get = (obj, p) =>
  String(p).split(".").reduce((acc, k) => (acc != null ? acc[k] : undefined), obj);

const FNS = {
  string: (v) => (v == null ? "" : String(v)),
  number: (v) => (Number.isFinite(Number(v)) ? Number(v) : 0),
  dateIso: (v) => {
    const x = typeof v === "number" ? new Date(v) : new Date(v ?? Date.now());
    return x.toISOString();
  }
};

export function generateAdapter(mapping) {
  if (!mapping || !mapping.source || !mapping.mappings) {
    throw new Error("Invalid mapping: require {source,mappings}");
  }
  const { name = "adapter", source, mappings, transform } = mapping;
  const defaults = transform?.defaults ?? {};

  async function fetchEvents(input = []) {
    if (!Array.isArray(input)) return [];
    return input.map((row, i) => {
      const out = { ...defaults, source };
      for (const [normKey, def] of Object.entries(mappings)) {
        const raw = get(row, def.path);
        const fn = def.fn ? FNS[def.fn] : (x) => x;
        out[normKey] = fn(raw);
      }
      const id = out.id ?? `${source}-${i}-${Date.now()}`;
      const ts =
        out.ts ??
        (out.timestamp ? FNS.dateIso(out.timestamp) : new Date().toISOString());
      return {
        id, ts,
        type: out.type ?? "unknown",
        athleteId: out.athleteId ?? "unknown",
        source,
        payload: out.payload ?? {},
        score: typeof out.score === "number" ? out.score : 0
      };
    });
  }

  return { name, source, fetchEvents };
}

export function harness({ mappingPath, samplePath, eventSchemaPath }) {
  const mapping = readJson(mappingPath);
  const sample = readJson(samplePath);
  const adapter = generateAdapter(mapping);

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(readJson(eventSchemaPath));

  return adapter.fetchEvents(sample).then((events) =>
    events.map((ev) => ({
      id: ev.id,
      ok: validate(ev),
      errors: validate.errors || null
    }))
  );
}

export default { generateAdapter, harness };
