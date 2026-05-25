# AX Mission Standard

**Version:** 0.1  
**Status:** Draft, implementation-ready  
**Purpose:** A minimal machine-readable manifest that tells agents what jobs they can do, which surfaces to use, what authorization is required, and how to verify freshness and success.

AX means **Agent Experience**. It is not "docs for agents." AX is the contract between a site and a calling agent.

The smallest useful contract is a mission manifest.

## Why This Exists

Our Mission Reachability Audit found the same gap across otherwise strong agent-readable sites:

- `/llms.txt` helps agents discover docs, but rarely declares valid jobs.
- Human docs can explain workflows, but do not define machine success conditions.
- OpenAPI and GraphQL schemas describe endpoints, but not missions.
- Pricing pages expose business data, but not stable machine pricing contracts.
- HTTP `ETag` and `Last-Modified` help, but are not a site-owned trust packet.

The missing layer is a compact manifest that says:

1. what missions are supported
2. which surfaces are authoritative for each mission
3. whether authentication or side effects are involved
4. what inputs and outputs are expected
5. how the agent can verify freshness, authority, and completion

## Quick Start

Publish this file at one of these locations:

```text
https://example.com/.well-known/ax-mission.json
https://example.com/agent.json
https://example.com/api/init
```

The canonical location for v0.1 is:

```text
/.well-known/ax-mission.json
```

Minimal manifest:

```json
{
  "schema_version": "0.1",
  "id": "com.example",
  "name": "Example",
  "description": "Example publishes machine-readable missions for calling agents.",
  "updated_at": "2026-05-25T00:00:00Z",
  "missions": [
    {
      "id": "find_capability",
      "title": "Find a capability",
      "description": "Answer whether Example supports a requested capability.",
      "category": "platform",
      "surfaces": [
        {
          "url": "https://example.com/llms.txt",
          "type": "documentation",
          "format": "text/markdown",
          "required": true
        }
      ],
      "auth": {
        "required": false
      },
      "input_schema": {
        "type": "object",
        "required": ["capability"],
        "properties": {
          "capability": { "type": "string" }
        },
        "additionalProperties": false
      },
      "output_schema": {
        "type": "object",
        "required": ["answer", "sources", "confidence"],
        "properties": {
          "answer": { "type": "string" },
          "sources": { "type": "array", "items": { "type": "string", "format": "uri" } },
          "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
        },
        "additionalProperties": false
      },
      "success": [
        {
          "id": "answer_with_sources",
          "description": "Return a direct answer with source URLs and confidence.",
          "verify_with": "source_urls_resolve"
        }
      ],
      "verify": {
        "freshness": "Use manifest updated_at and linked surface headers.",
        "authority": "Use only URLs under example.com unless explicitly delegated.",
        "success_contract": "The response must satisfy output_schema and include at least one source URL."
      }
    }
  ],
  "trust": {
    "updated_at": "2026-05-25T00:00:00Z",
    "authority": "https://example.com",
    "generated_by": "example-docs-build",
    "content_hashes": [
      {
        "url": "https://example.com/llms.txt",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      }
    ],
    "breaking_changes_since": null
  }
}
```

Validate an implementation:

```bash
node tools/validate-agent-json.mjs examples/minimal.agent.json
```

Validate every bundled example:

```bash
npm test
```

## What v0.1 Defines

The v0.1 standard defines one artifact: an **AX Mission Manifest**.

A manifest contains:

| Field | Required | Purpose |
|---|---:|---|
| `schema_version` | yes | Must be `"0.1"` for this version. |
| `id` | yes | Stable reverse-DNS style identifier for the publisher. |
| `name` | yes | Human-readable publisher name. |
| `description` | yes | Short description of the manifest's scope. |
| `updated_at` | yes | ISO 8601 timestamp for manifest freshness. |
| `missions` | yes | One or more supported agent jobs. |
| `trust` | yes | Site-owned freshness, authority, and integrity metadata. |

Each mission contains:

| Field | Required | Purpose |
|---|---:|---|
| `id` | yes | Stable snake_case mission identifier. |
| `title` | yes | Human-readable mission name. |
| `description` | yes | What the agent is expected to do. |
| `category` | yes | `principal`, `platform`, `protocol`, `commerce`, `support`, or `other`. |
| `surfaces` | yes | Authoritative docs, APIs, schemas, or tools for the mission. |
| `auth` | yes | Whether credentials, scopes, or account state are required. |
| `input_schema` | yes | JSON Schema for mission input. |
| `output_schema` | yes | JSON Schema for mission output. |
| `success` | yes | Machine-checkable or operator-checkable completion criteria. |
| `verify` | yes | Freshness, authority, and success-contract guidance. |

## Repository Layout

```text
.
├── README.md
├── spec/
│   └── ax-mission-standard-v0.1.md
├── schemas/
│   ├── ax-mission-manifest.v0.1.schema.json
│   └── mission.v0.1.schema.json
├── examples/
│   ├── minimal.agent.json
│   ├── principal.agent.json
│   └── platform.agent.json
├── tools/
│   ├── validate-agent-json.mjs
│   └── check-audits.mjs
├── research/
│   └── mission-reachability-audit.md
├── audits/
│   ├── mczaykowski.com.json
│   ├── stripe.com.json
│   ├── linear.app.json
│   ├── platform.claude.com.json
│   └── vercel.com.json
└── brief.md
```

## Adoption Levels

| Level | Name | Requirement | Value |
|---:|---|---|---|
| 0 | Discoverable | Publish `/llms.txt` or equivalent. | Agents can find docs. |
| 1 | Missioned | Publish an AX Mission Manifest. | Agents know valid jobs and surfaces. |
| 2 | Contracted | Add schemas, success criteria, and auth scopes. | Agents can plan and produce bounded outputs. |
| 3 | Verifiable | Add hashes, versioning, evals, or validation endpoints. | Agents can prove freshness and completion. |

v0.1 is designed to make Level 1 cheap and Level 2 practical.

## Design Constraints

- Small enough for a team to ship in one pull request.
- Strict enough that agents do not have to infer core jobs from prose.
- Compatible with existing `/llms.txt`, OpenAPI, GraphQL, MCP, CLI, and docs surfaces.
- Honest about side effects and authentication.
- Verifiable by static schema and simple runtime checks.

## Research Basis

This standard is grounded in the Mission Reachability Audit work in [`research/mission-reachability-audit.md`](./research/mission-reachability-audit.md).

Audited examples include:

- `mczaykowski.com`
- `stripe.com`
- `linear.app`
- `platform.claude.com/docs`
- `vercel.com`

The audit conclusion is direct: useful agent-readable docs already exist, but the missing high-value layer is declared missions plus verification.

## Versioning

v0.1 is intentionally narrow. Future versions may add:

- detached signatures
- standardized eval endpoints
- pricing contract schema
- permission and consent profiles
- compatibility registry for discovery locations
- conformance test suite

Breaking changes must increment the minor version and include migration notes.
