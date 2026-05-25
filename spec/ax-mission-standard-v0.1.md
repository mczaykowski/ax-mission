# AX Mission Standard v0.1

**Status:** Draft, implementation-ready  
**Updated:** 2026-05-25  
**Artifact:** AX Mission Manifest  
**Canonical schema:** [`../schemas/ax-mission-manifest.v0.1.schema.json`](../schemas/ax-mission-manifest.v0.1.schema.json)

## 1. Scope

AX means **Agent Experience**. The AX Mission Standard defines a minimal manifest that allows a calling agent to discover supported missions, resolve authoritative surfaces, understand inputs and outputs, complete the mission within stated authorization boundaries, and verify freshness and success.

This version defines only the manifest shape. It does not define a transport protocol, auth protocol, eval protocol, or agent runtime.

## 2. Terminology

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are to be interpreted as normative requirements.

**Publisher**: The site, product, person, organization, protocol, or service publishing the manifest.

**Calling agent**: A software agent reading the manifest to perform a mission.

**Mission**: A named job the publisher allows and expects a calling agent to complete using published surfaces.

**Surface**: A document, API, schema, endpoint, MCP server, CLI reference, eval, fixture, or other artifact that supports a mission.

**Trust packet**: Manifest metadata that lets a calling agent reason about freshness, authority, integrity, and breaking changes.

## 3. Discovery

A publisher SHOULD expose the manifest at:

```text
/.well-known/ax-mission.json
```

A publisher MAY also expose equivalent manifests at:

```text
/agent.json
/api/init
```

If multiple discovery locations are exposed, they SHOULD return equivalent mission content or redirect to the canonical manifest.

The response SHOULD use:

```text
Content-Type: application/json; charset=utf-8
```

The response SHOULD include HTTP cache validators such as `ETag` or `Last-Modified`, but HTTP headers do not replace the manifest trust packet.

## 4. Manifest Object

An AX Mission Manifest MUST be a JSON object with these required fields:

| Field | Type | Requirement |
|---|---|---|
| `schema_version` | string | MUST be `"0.1"`. |
| `id` | string | MUST be a stable identifier using reverse-DNS style segments. |
| `name` | string | MUST be a human-readable publisher name. |
| `description` | string | MUST describe the manifest scope. |
| `updated_at` | string | MUST be an ISO 8601 UTC timestamp. |
| `missions` | array | MUST contain at least one mission. |
| `trust` | object | MUST describe authority and freshness. |

The manifest MAY include:

| Field | Type | Purpose |
|---|---|---|
| `publisher` | object | Legal or operating identity behind the manifest. |
| `entrypoints` | array | Known canonical and compatibility locations for the manifest. |
| `links` | array | Related human or machine resources. |
| `contact` | object | Security, support, or standards contact information. |

## 5. Mission Object

A mission MUST be a JSON object with these required fields:

| Field | Type | Requirement |
|---|---|---|
| `id` | string | Stable snake_case identifier. |
| `title` | string | Short human-readable title. |
| `description` | string | Concrete job description. |
| `category` | string | One of `principal`, `platform`, `protocol`, `commerce`, `support`, `other`. |
| `surfaces` | array | One or more authoritative surfaces. |
| `auth` | object | Authorization requirement. |
| `input_schema` | object | JSON Schema for mission input. |
| `output_schema` | object | JSON Schema for mission output. |
| `success` | array | One or more success criteria. |
| `verify` | object | Freshness, authority, and success-contract verification guidance. |

The mission `id` MUST remain stable across versions unless the meaning of the mission changes. If the mission is removed or replaced, the publisher SHOULD document the change in `trust.breaking_changes_since` or a linked changelog.

## 6. Surfaces

Each mission surface MUST include:

| Field | Type | Requirement |
|---|---|---|
| `url` | string | Absolute URL or root-relative path. |
| `type` | string | One of `documentation`, `api`, `schema`, `mcp`, `cli`, `eval`, `fixture`, `contact`, `other`. |
| `format` | string | Media or artifact format, such as `application/json`, `text/markdown`, `openapi`, `graphql`, `mcp`, or `cli`. |
| `required` | boolean | Whether the surface is required for mission completion. |

Surfaces SHOULD be ordered from highest authority to lowest authority for the mission.

For machine-readable APIs, a surface SHOULD link to an OpenAPI document, GraphQL SDL, JSON Schema, MCP server descriptor, or equivalent typed contract.

## 7. Auth and Side Effects

The `auth` object MUST contain:

| Field | Type | Requirement |
|---|---|---|
| `required` | boolean | Whether mission completion requires credentials or account state. |

If `auth.required` is `true`, the object SHOULD also contain:

| Field | Type | Purpose |
|---|---|---|
| `type` | string | `api_key`, `oauth`, `session`, `account`, `none`, or `other`. |
| `scopes` | array | Required permission scopes or roles. |
| `side_effects` | string | One of `none`, `read`, `write`, `external_effect`, `unknown`. |
| `human_approval_required` | boolean | Whether a human must approve execution. |

Calling agents MUST NOT perform write or external-effect missions unless the user has authorized them and the mission declares the required auth and side-effect profile.

## 8. Input and Output Schemas

`input_schema` and `output_schema` MUST be JSON Schema objects.

The standard does not require a specific JSON Schema draft for nested mission schemas in v0.1, but publishers SHOULD use JSON Schema 2020-12 when possible.

Calling agents SHOULD validate mission inputs before attempting a mission and SHOULD validate their final structured result against `output_schema` when the output is machine-readable.

## 9. Success Criteria

Each item in `success` MUST include:

| Field | Type | Requirement |
|---|---|---|
| `id` | string | Stable snake_case criterion identifier. |
| `description` | string | What must be true for the mission to count as complete. |
| `verify_with` | string | How the agent can verify the criterion. |

`verify_with` MAY name a schema, endpoint, CLI output, source URL check, content hash, eval, fixture, human approval, or other verification method.

## 10. Mission Verification

Each mission MUST include `verify` with:

| Field | Type | Requirement |
|---|---|---|
| `freshness` | string | How the calling agent confirms the mission surfaces are current. |
| `authority` | string | How the calling agent confirms it is using the authoritative source. |
| `success_contract` | string | How the calling agent confirms completion is valid. |

This field can be prose in v0.1, but it MUST be specific enough for a competent calling agent to act on without guessing.

## 11. Trust Packet

The top-level `trust` object MUST include:

| Field | Type | Requirement |
|---|---|---|
| `updated_at` | string | ISO 8601 UTC timestamp for trust metadata. |
| `authority` | string | Canonical origin or publisher authority URL. |

The top-level `trust` object SHOULD include:

| Field | Type | Purpose |
|---|---|---|
| `generated_by` | string | Build system, CMS, or process that generated the manifest. |
| `content_hashes` | array | SHA-256 hashes for authoritative surfaces. |
| `breaking_changes_since` | string or null | Timestamp of most recent breaking mission change, or null. |
| `expires_at` | string | Time after which agents should treat the manifest as stale. |
| `changelog` | string | URL for manifest or mission changes. |

Each `content_hashes` item MUST include:

| Field | Type | Requirement |
|---|---|---|
| `url` | string | Surface URL. |
| `sha256` | string | Lowercase hex SHA-256 digest. |

## 12. Compatibility With Existing Surfaces

The manifest is designed to complement existing artifacts:

| Existing artifact | Role under AX Mission Standard |
|---|---|
| `/llms.txt` | Good discovery and summarization surface. Link it from mission `surfaces`. |
| `/llms-full.txt` | Good full-corpus surface. Link it from mission `surfaces`. |
| OpenAPI | API reference or execution contract. Link it as `type: "schema"` or `type: "api"`. |
| GraphQL SDL | Typed API contract. Link it as `type: "schema"`. |
| MCP server | Tool execution surface. Link it as `type: "mcp"`. |
| CLI docs | Operational execution surface. Link it as `type: "cli"` or `documentation`. |
| Pricing pages | Useful evidence, but SHOULD evolve into pricing JSON for deterministic plan fit. |

## 13. Conformance

A manifest conforms to v0.1 if:

1. It is valid JSON.
2. It validates against `schemas/ax-mission-manifest.v0.1.schema.json`.
3. It contains at least one mission.
4. Every mission declares surfaces, auth, input schema, output schema, success criteria, and verification guidance.
5. The top-level trust packet declares freshness and authority.

The bundled validator performs structural validation and additional runtime checks:

```bash
node tools/validate-agent-json.mjs examples/minimal.agent.json
```

## 14. Non-Goals

v0.1 does not define:

- agent identity
- delegated authorization
- payment or billing authorization
- live tool invocation protocol
- signed manifests
- conformance badges
- centralized registry
- ranking or quality score

Those are intentionally left out so the mission layer can ship first.

## 15. Change Policy

Additive fields MAY be introduced in v0.x as optional fields.

Any change that invalidates a conforming v0.1 manifest MUST become v0.2 or later and include migration notes.
