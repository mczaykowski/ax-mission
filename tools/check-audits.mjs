#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const auditsDir = path.join(repoRoot, "audits");

let failed = false;
let warned = false;

for (const entry of fs.readdirSync(auditsDir).sort()) {
  if (!entry.endsWith(".json")) continue;

  const file = path.join(auditsDir, entry);
  const audit = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = [];
  const warnings = [];

  if (!audit.target) errors.push("target is required");
  if (!audit.pattern) warnings.push("legacy audit missing pattern");
  if (!Array.isArray(audit.source_urls) || audit.source_urls.length === 0) warnings.push("legacy audit missing source_urls");
  if (!Array.isArray(audit.per_mission) || audit.per_mission.length === 0) errors.push("per_mission must be a non-empty array");

  if (Array.isArray(audit.per_mission)) {
    const computed = audit.per_mission.reduce((sum, mission) => {
      if (typeof mission.mrs !== "number") errors.push(`${mission.mission || "mission"} missing numeric mrs`);
      if (typeof mission.auth_required !== "boolean") {
        warnings.push(`${mission.mission || "mission"} missing auth_required`);
      }
      if (!mission.verify_evidence) {
        warnings.push(`${mission.mission || "mission"} missing verify_evidence`);
      }
      return sum + Number(mission.mrs || 0);
    }, 0) / audit.per_mission.length;

    if (typeof audit.site_mrs === "number" && Number(computed.toFixed(2)) !== audit.site_mrs) {
      errors.push(`site_mrs ${audit.site_mrs} does not match computed ${Number(computed.toFixed(2))}`);
    }
  }

  if (errors.length > 0) {
    failed = true;
    console.error(`FAIL audits/${entry}`);
    for (const error of errors) console.error(`  - ${error}`);
  } else if (warnings.length > 0) {
    warned = true;
    console.warn(`WARN audits/${entry}`);
    for (const warning of warnings) console.warn(`  - ${warning}`);
  } else {
    console.log(`PASS audits/${entry}`);
  }
}

if (warned) console.warn("Audit fixture warnings are non-fatal; they identify legacy research files, not standard conformance failures.");
if (failed) process.exit(1);
