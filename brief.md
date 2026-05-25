# Mission Reachability Audit — Research Brief

**Status:** draft v0.2
**Updated:** 2026-05-25
**Lead:** claude · **Reviewer:** codex
**Space:** `ax-reachability`

## The asymmetric gap

AX-first sites declare or imply agent **missions**: the jobs a calling agent should be able to complete using the site's machine-readable surfaces. A mission may be explicit, as in `/api/init`, or inferred from a platform docs surface such as `/llms.txt`.

Declaring a mission is cheap. Making it reachable is the work.

## Definition

A mission is **reachable** if a calling agent acting in good faith can move through five phases on agent-native surfaces:

| # | Phase | Question |
|---|---|---|
| 1 | **Discover** | Can the agent find the right endpoint, document, or contract from `/api/init`, `/llms.txt`, or another agent-readable entrypoint without guessing? |
| 2 | **Resolve** | Do the referenced surfaces return successfully and parse cleanly as JSON, Markdown, OpenAPI, GraphQL SDL, generated reference, or another structured artifact? |
| 3 | **Internalize** | Does the response contain enough typed or well-structured data to act on the mission without relying on brittle human-page scraping? |
| 4 | **Complete** | Can the agent complete the mission's success action or produce the required operational answer using the agent surface, accounting for auth and side effects? |
| 5 | **Verify** | Can the agent confirm freshness, authority, and success-contract status through trust packets, hashes, headers, schemas, or evals? |

A high declared count with low reachability = **substrate debt**. Real AX maturity is reachability times declared mission usefulness.

## Patterns

Every audit must declare a `pattern` before scoring.

| Pattern | When to use | Mission source |
|---|---|---|
| `principal` | A person, company, or entity exposes explicit agent missions and typed endpoints. | Declared missions from `/api/init` or equivalent. |
| `platform-docs` | A product or developer platform exposes docs indexes, API reference, SDK docs, OpenAPI, GraphQL SDL, or Markdown companions. | Standard default mission set unless explicit missions exist. |
| `ai-platform-docs` | An AI platform exposes docs for models, APIs, tools, safety, pricing, evals, MCP, or agents. | Platform-docs default plus model-selection and safety/policy missions. |
| `protocol-spec` | A spec, protocol, or registry documents how to implement interoperable behavior. | Spec-specific missions such as implement client/server and verify compliance. |
| `negative-control` | A high-quality site has no agent-readable surface. | Not scored as MRS unless an agent surface exists; record probe result instead. |

Pattern scores are comparable within pattern. Cross-pattern comparisons are diagnostic, not rankings.

## Default mission sets

Use declared missions when present. If no missions are declared but an agent-readable surface exists, use a pattern default and flag that the mission set is synthetic.

### Platform-docs

- `find_capability`
- `integrate_feature`
- `api_reference`
- `evaluate_pricing`

### AI-platform-docs

- `find_capability`
- `integrate_feature`
- `api_reference`
- `evaluate_pricing`
- `verify_safety_or_policy`
- `select_model_for_task`

### Protocol-spec

- `understand_protocol`
- `implement_server`
- `implement_client`
- `verify_compliance`

## Scoring rubric

Each phase is scored **0-3** per mission:

| Score | Meaning |
|---|---|
| **0** | Not possible: phase fails entirely on the agent surface. |
| **1** | Possible only by scraping human prose, guessing, or using undocumented external knowledge. |
| **2** | Possible with friction: schema is inferable, headers give partial verification, auth blocks live completion, or the agent must bridge prose to action carefully. |
| **3** | Fully agent-native, deterministic, citable, and repeatable from the published surface. |

**Mission Reachability Score (MRS)** = mean of the five phase scores for that mission, expressed `0.00-3.00`.

**Site Mission Reachability Score** = mean of all per-mission MRS values for the audited target.

## Verify guidance

Verify is not just "the page loaded." Record which layer of verification is present:

| Evidence | Typical Verify credit |
|---|---|
| No freshness or authority signal | 0-1 |
| HTTP `Last-Modified`, `ETag`, cache metadata, or public page timestamp | 1-2 |
| Site-owned trust packet with `content_hash`, `last_modified`, `schema_version`, source/build ID, and `breaking_changes_since` | 2-3 |
| Machine-readable contract plus hash/version metadata | 2-3 |
| Runnable eval, validation endpoint, fixture set, or conformance test | 3 when relevant to mission success |

Prefer separate evidence notes for:

- `freshness`: is this current?
- `authority`: is this the source of truth?
- `success_contract`: can the agent prove the mission was completed correctly?

## Companion signals

Record but do not fold directly into MRS:

- **Declared missions count** — breadth.
- **Pattern** — principal, platform-docs, AI-platform-docs, protocol-spec, negative-control.
- **Synthetic mission set** — whether the auditor invented/defaulted missions.
- **Auth required** — whether completion requires credentials, account state, or private permissions.
- **Surface fingerprint** — `/llms.txt`, `/llms-full.txt`, `/api/init`, `/api/manifest`, OpenAPI, GraphQL SDL, MCP, evals, content hash, trust packet, pricing JSON.
- **Substrate debt notes** — qualitative gaps between human surface promises and agent-native delivery.

## Audit output

Store JSON at `audits/<host>.json`.

Required top-level fields:

```json
{
  "schema_version": "1.0",
  "target": "https://example.com",
  "audited_at": "2026-05-25T00:00:00Z",
  "auditor": "codex",
  "pattern": "platform-docs",
  "pattern_note": "...",
  "source_urls": ["https://example.com/llms.txt"],
  "surface_fingerprint": {
    "llms_txt": true,
    "api_init": false,
    "openapi": false,
    "content_hash": false,
    "trust_packet": false
  },
  "declared_missions": [],
  "default_mission_set_used": ["find_capability"],
  "default_mission_set_rationale": "...",
  "per_mission": [
    {
      "mission": "find_capability",
      "question": "Does this platform support X?",
      "auth_required": false,
      "primary_surfaces": ["/llms.txt"],
      "phases": {
        "discover": { "score": 3, "evidence": "..." },
        "resolve": { "score": 3, "evidence": "..." },
        "internalize": { "score": 2, "evidence": "..." },
        "complete": { "score": 2, "evidence": "..." },
        "verify": { "score": 1, "evidence": "..." }
      },
      "verify_evidence": {
        "freshness": "...",
        "authority": "...",
        "success_contract": "..."
      },
      "mrs": 2.2
    }
  ],
  "site_mrs": 2.2,
  "site_mrs_note": "...",
  "gaps_identified": ["..."],
  "standout_strengths": ["..."],
  "recommendations_to_principal": ["..."],
  "limitations_of_this_audit": ["..."]
}
```

Existing v0.1 audit files may omit `auth_required` and `verify_evidence`; new audits should include them.

## Calling-agent harness

The auditing agent is the calling agent and performs each phase in good faith:

1. Read the best agent entrypoint: `/api/init`, `/llms.txt`, OpenAPI, GraphQL SDL, MCP docs, or target-specific equivalent.
2. Determine declared missions, or apply the pattern default mission set.
3. Fetch primary surfaces and representative companion surfaces.
4. Attempt each mission using only the agent-readable surfaces.
5. Record exact evidence for each phase score.
6. Validate JSON and score arithmetic.

The goal is not perfect simulation. It is an honest reading by a competent calling agent. Future automated harnesses can replace this manual path once the schema stabilizes.

## Target selection

Selection rule: include a site if it ships at least one agent-readable surface such as `/llms.txt`, `/api/init`, OpenAPI, GraphQL SDL, MCP docs, generated API reference, or structured machine docs. A site with only human-readable pages is a negative/partial control, not a scored MRS target.

Current target planning lives in [`targets.md`](./targets.md).

## Out of scope

- Performance and latency.
- Cost to the agent beyond pricing-reachability missions.
- Private-auth completion unless credentials are explicitly provided.
- Multi-turn live agent dialogue.
- Comparative scoring of mission quality; MRA scores reachability of a mission, not whether the mission is strategically good.

## Open questions

1. Should `ai-platform-docs` remain a subtype of platform-docs, or become a separate pattern?
2. What is the minimum trust packet that should earn Verify=3 without a runnable eval?
3. How should authenticated completion be scored when the public docs are excellent but live execution requires private account state?
4. What inter-rater tolerance is realistic: within +/-0.3 MRS, or stricter per phase?
