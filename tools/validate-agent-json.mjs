#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const schemaPath = path.join(repoRoot, "schemas", "ax-mission-manifest.v0.1.schema.json");

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("usage: node tools/validate-agent-json.mjs <manifest...>");
  process.exit(2);
}

const schema = readJson(schemaPath);
let failed = false;

for (const file of files) {
  const errors = [];
  let manifest;

  try {
    manifest = readJson(path.resolve(file));
  } catch (error) {
    errors.push(error.message);
  }

  if (manifest) {
    validateManifest(manifest, errors);
  }

  if (errors.length > 0) {
    failed = true;
    console.error(`FAIL ${file}`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
  } else {
    console.log(`PASS ${file}`);
  }
}

if (failed) {
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validateManifest(value, errors) {
  requireObject(value, "$", errors);
  requireExactKeys(value, "$", schema.required, new Set(Object.keys(schema.properties)), errors);
  requireString(value.schema_version, "$.schema_version", errors);
  if (value.schema_version !== "0.1") {
    errors.push("$.schema_version must be \"0.1\"");
  }

  requirePattern(value.id, "$.id", /^[a-z0-9]+(\.[a-z0-9][a-z0-9-]*)+$/, errors);
  requireString(value.name, "$.name", errors);
  requireString(value.description, "$.description", errors);
  requireDateTime(value.updated_at, "$.updated_at", errors);

  if (value.publisher !== undefined) {
    validatePublisher(value.publisher, "$.publisher", errors);
  }

  if (value.entrypoints !== undefined) {
    validateLinks(value.entrypoints, "$.entrypoints", errors);
  }

  if (value.links !== undefined) {
    validateLinks(value.links, "$.links", errors);
  }

  if (value.contact !== undefined) {
    validateContact(value.contact, "$.contact", errors);
  }

  requireArray(value.missions, "$.missions", errors, { minItems: 1 });
  if (Array.isArray(value.missions)) {
    const ids = new Set();
    value.missions.forEach((mission, index) => {
      validateMission(mission, `$.missions[${index}]`, errors);
      if (mission && typeof mission.id === "string") {
        if (ids.has(mission.id)) {
          errors.push(`$.missions[${index}].id duplicates mission id "${mission.id}"`);
        }
        ids.add(mission.id);
      }
    });
  }

  validateTrust(value.trust, "$.trust", errors);
}

function validatePublisher(value, base, errors) {
  requireObject(value, base, errors);
  requireExactKeys(value, base, ["name", "url"], new Set(["name", "url"]), errors);
  requireString(value.name, `${base}.name`, errors);
  requireUri(value.url, `${base}.url`, errors);
}

function validateLinks(value, base, errors) {
  requireArray(value, base, errors, { minItems: 1 });
  if (!Array.isArray(value)) return;
  value.forEach((link, index) => {
    const item = `${base}[${index}]`;
    requireObject(link, item, errors);
    requireExactKeys(link, item, ["url", "type"], new Set(["url", "type", "description"]), errors);
    requireString(link.url, `${item}.url`, errors);
    requireString(link.type, `${item}.type`, errors);
    if (link.description !== undefined) requireString(link.description, `${item}.description`, errors);
  });
}

function validateContact(value, base, errors) {
  requireObject(value, base, errors);
  requireExactKeys(value, base, [], new Set(["security", "support", "standards"]), errors);
  for (const key of ["security", "support", "standards"]) {
    if (value[key] !== undefined) requireUri(value[key], `${base}.${key}`, errors);
  }
}

function validateMission(value, base, errors) {
  requireObject(value, base, errors);
  requireExactKeys(
    value,
    base,
    ["id", "title", "description", "category", "surfaces", "auth", "input_schema", "output_schema", "success", "verify"],
    new Set(["id", "title", "description", "category", "surfaces", "auth", "input_schema", "output_schema", "success", "verify"]),
    errors,
  );
  requirePattern(value.id, `${base}.id`, /^[a-z][a-z0-9_]*$/, errors);
  requireString(value.title, `${base}.title`, errors);
  requireString(value.description, `${base}.description`, errors);
  requireEnum(value.category, `${base}.category`, ["principal", "platform", "protocol", "commerce", "support", "other"], errors);
  validateSurfaces(value.surfaces, `${base}.surfaces`, errors);
  validateAuth(value.auth, `${base}.auth`, errors);
  requireObject(value.input_schema, `${base}.input_schema`, errors);
  requireObject(value.output_schema, `${base}.output_schema`, errors);
  validateSuccess(value.success, `${base}.success`, errors);
  validateMissionVerify(value.verify, `${base}.verify`, errors);
}

function validateSurfaces(value, base, errors) {
  requireArray(value, base, errors, { minItems: 1 });
  if (!Array.isArray(value)) return;
  value.forEach((surface, index) => {
    const item = `${base}[${index}]`;
    requireObject(surface, item, errors);
    requireExactKeys(surface, item, ["url", "type", "format", "required"], new Set(["url", "type", "format", "required"]), errors);
    requireString(surface.url, `${item}.url`, errors);
    requireEnum(surface.type, `${item}.type`, ["documentation", "api", "schema", "mcp", "cli", "eval", "fixture", "contact", "other"], errors);
    requireString(surface.format, `${item}.format`, errors);
    requireBoolean(surface.required, `${item}.required`, errors);
  });
}

function validateAuth(value, base, errors) {
  requireObject(value, base, errors);
  requireExactKeys(value, base, ["required"], new Set(["required", "type", "scopes", "side_effects", "human_approval_required"]), errors);
  requireBoolean(value.required, `${base}.required`, errors);
  if (value.type !== undefined) requireEnum(value.type, `${base}.type`, ["none", "api_key", "oauth", "session", "account", "other"], errors);
  if (value.scopes !== undefined) {
    requireArray(value.scopes, `${base}.scopes`, errors);
    if (Array.isArray(value.scopes)) value.scopes.forEach((scope, index) => requireString(scope, `${base}.scopes[${index}]`, errors));
  }
  if (value.side_effects !== undefined) requireEnum(value.side_effects, `${base}.side_effects`, ["none", "read", "write", "external_effect", "unknown"], errors);
  if (value.human_approval_required !== undefined) requireBoolean(value.human_approval_required, `${base}.human_approval_required`, errors);

  if (value.required === true && value.side_effects === "write" && value.human_approval_required !== true) {
    errors.push(`${base}.human_approval_required should be true for write missions in v0.1 examples`);
  }
}

function validateSuccess(value, base, errors) {
  requireArray(value, base, errors, { minItems: 1 });
  if (!Array.isArray(value)) return;
  value.forEach((criterion, index) => {
    const item = `${base}[${index}]`;
    requireObject(criterion, item, errors);
    requireExactKeys(criterion, item, ["id", "description", "verify_with"], new Set(["id", "description", "verify_with"]), errors);
    requirePattern(criterion.id, `${item}.id`, /^[a-z][a-z0-9_]*$/, errors);
    requireString(criterion.description, `${item}.description`, errors);
    requireString(criterion.verify_with, `${item}.verify_with`, errors);
  });
}

function validateMissionVerify(value, base, errors) {
  requireObject(value, base, errors);
  requireExactKeys(value, base, ["freshness", "authority", "success_contract"], new Set(["freshness", "authority", "success_contract"]), errors);
  requireString(value.freshness, `${base}.freshness`, errors);
  requireString(value.authority, `${base}.authority`, errors);
  requireString(value.success_contract, `${base}.success_contract`, errors);
}

function validateTrust(value, base, errors) {
  requireObject(value, base, errors);
  requireExactKeys(value, base, ["updated_at", "authority"], new Set(["updated_at", "authority", "generated_by", "content_hashes", "breaking_changes_since", "expires_at", "changelog"]), errors);
  requireDateTime(value.updated_at, `${base}.updated_at`, errors);
  requireUri(value.authority, `${base}.authority`, errors);
  if (value.generated_by !== undefined) requireString(value.generated_by, `${base}.generated_by`, errors);
  if (value.content_hashes !== undefined) {
    requireArray(value.content_hashes, `${base}.content_hashes`, errors);
    if (Array.isArray(value.content_hashes)) {
      value.content_hashes.forEach((hash, index) => {
        const item = `${base}.content_hashes[${index}]`;
        requireObject(hash, item, errors);
        requireExactKeys(hash, item, ["url", "sha256"], new Set(["url", "sha256"]), errors);
        requireString(hash.url, `${item}.url`, errors);
        requirePattern(hash.sha256, `${item}.sha256`, /^[a-f0-9]{64}$/, errors);
      });
    }
  }
  if (value.breaking_changes_since !== undefined && value.breaking_changes_since !== null) requireDateTime(value.breaking_changes_since, `${base}.breaking_changes_since`, errors);
  if (value.expires_at !== undefined) requireDateTime(value.expires_at, `${base}.expires_at`, errors);
  if (value.changelog !== undefined) requireUri(value.changelog, `${base}.changelog`, errors);
}

function requireObject(value, pathName, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${pathName} must be an object`);
  }
}

function requireExactKeys(value, pathName, required, allowed, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  for (const key of required) {
    if (!(key in value)) errors.push(`${pathName}.${key} is required`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${pathName}.${key} is not allowed in v0.1`);
  }
}

function requireString(value, pathName, errors) {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${pathName} must be a non-empty string`);
  }
}

function requireBoolean(value, pathName, errors) {
  if (typeof value !== "boolean") {
    errors.push(`${pathName} must be a boolean`);
  }
}

function requireArray(value, pathName, errors, options = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${pathName} must be an array`);
    return;
  }
  if (options.minItems !== undefined && value.length < options.minItems) {
    errors.push(`${pathName} must contain at least ${options.minItems} item(s)`);
  }
}

function requirePattern(value, pathName, pattern, errors) {
  requireString(value, pathName, errors);
  if (typeof value === "string" && !pattern.test(value)) {
    errors.push(`${pathName} has invalid format`);
  }
}

function requireEnum(value, pathName, allowed, errors) {
  if (!allowed.includes(value)) {
    errors.push(`${pathName} must be one of: ${allowed.join(", ")}`);
  }
}

function requireDateTime(value, pathName, errors) {
  requireString(value, pathName, errors);
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
    errors.push(`${pathName} must be an ISO 8601 UTC timestamp`);
    return;
  }
  if (typeof value === "string" && Number.isNaN(Date.parse(value))) {
    errors.push(`${pathName} must parse as a date-time`);
  }
}

function requireUri(value, pathName, errors) {
  requireString(value, pathName, errors);
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (!["https:", "mailto:"].includes(url.protocol)) {
      errors.push(`${pathName} must use https: or mailto:`);
    }
  } catch {
    errors.push(`${pathName} must be a valid URI`);
  }
}
