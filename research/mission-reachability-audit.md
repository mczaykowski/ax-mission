# Mission Reachability Audit (MRA) — v0.2 Findings

**Updated:** 2026-05-25
**Auditors:** claude, codex
**Repo:** `/Users/mc/Projects/ax-research`
**Methodology:** [`brief.md`](./brief.md) · **Audits:** [`audits/`](./audits/) · **Target matrix:** [`targets.md`](./targets.md)

> AX-first sites declare or imply *missions* — what a calling agent should be able to do with them. The methodology question this report tests: **declared is not the same as reachable**. We score five phases (Discover, Resolve, Internalize, Complete, Verify) per mission, 0-3 each, and average to a Mission Reachability Score.

## Headline findings

### 1. Pattern has to be first-class

The audit set now covers three useful patterns:

| Pattern | Examples | What it declares | What it serves |
|---|---|---|---|
| **Principal** | `mczaykowski.com` | Explicit missions, mission-to-endpoint map, typed contracts | Representing, citing, evaluating, or contacting a person/entity |
| **Platform-docs** | `stripe.com`, `linear.app`, `vercel.com` | Docs index, Markdown companions, API docs | Helping an agent use a product or API |
| **AI-platform-docs** | `platform.claude.com/docs` | Large AI-native docs corpus, generated API reference, model/tool/safety docs | Helping an agent build with an AI platform |

Principal and platform missions are not interchangeable. Principal missions are relational (`prepare_introduction`, `evaluate_collaboration`). Platform missions are operational (`integrate_feature`, `api_reference`, `evaluate_pricing`). AI-platform docs add model selection and safety/policy handling as first-class jobs.

### 2. Principal surfaces still lead on trust discipline

`mczaykowski.com` remains the strongest audited surface at site MRS **2.8**. The reason is not breadth; it is discipline:

- explicit declared missions
- mission-to-endpoint mapping
- typed JSON responses
- trust packets with `content_hash`, `last_modified`, `breaking_changes_since`, and `schema_version`
- structured evidence fields such as evidence level and citation confidence

The platform docs are broader, but they usually make agents infer missions from a taxonomy and verify currency from HTTP headers rather than an explicit trust contract.

### 3. Full docs surfaces are better, but not finished

`platform.claude.com/docs` and `vercel.com` both scored **2.60**, above Stripe (**2.30**) and Linear (**2.45**). Claude has `/llms.txt`, `/llms-full.txt`, generated Markdown API reference, model capability docs, pricing docs, and concrete refusal-handling guidance. Vercel has `/llms.txt`, `/docs/llms-full.txt`, per-page `last_updated` metadata, a public OpenAPI contract, CLI deployment semantics, agent resources, MCP docs, and detailed pricing tables.

But the same AX gap remains on both:

- no `/api/init` mission declaration
- no signed or content-hash trust packet
- no complete site-owned mission contract linked from `/llms.txt`
- no executable eval contract for caller verification

That makes these docs strong at Discover/Resolve/Internalize and only partial at Verify.

### 4. Verify is still the forcing function

Across the current audits, Verify separates mature AX from useful documentation.

| Site | Pattern | Verify scores |
|---|---|---|
| mczaykowski.com | principal | 3 / 3 / 3 / 3 |
| stripe.com | platform-docs | 1 / 1 / 2 / 1 |
| linear.app | platform-docs | 1 / 1 / 2 / 1 |
| vercel.com | platform-docs | 2 / 2 / 2 / 2 / 2 |
| platform.claude.com/docs | AI-platform-docs | 2 / 2 / 2 / 2 / 2 / 2 |

HTTP `Last-Modified` and `ETag` deserve partial credit. They are not equivalent to a site-owned AX trust packet. A runnable eval or validation endpoint would be stronger still.

### 5. The sharper corporate-root finding

The earlier "AI companies do not eat their own dog food" framing is too broad. The stronger finding is:

**AX currently lives in product-doc surfaces, not corporate-root surfaces.**

Observed examples:

- `platform.claude.com/docs` has a strong agent-readable docs surface; `anthropic.com` corporate root is not the primary agent surface.
- `developers.openai.com/api/docs` is reachable through the product-doc path; `openai.com/llms.txt` returned 403 during probing.
- Developer-product sites such as Linear, Stripe docs, Vercel, GitHub docs, Cloudflare docs, AWS docs, Shopify dev, and MCP docs often expose `/llms.txt`; general-purpose public sites may not.

This is not a moral failure. It is a boundary: AX adoption starts where product documentation already has operational structure.

## Per-site scorecards

### mczaykowski.com — principal

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---|:---:|:---:|:---:|:---:|:---:|---:|
| evaluate_collaboration | 3 | 3 | 3 | 3 | 3 | **3.0** |
| research_ideas | 3 | 3 | 2 | 2 | 3 | **2.6** |
| assess_expertise | 3 | 3 | 2 | 2 | 3 | **2.6** |
| prepare_introduction | 3 | 3 | 3 | 3 | 3 | **3.0** |
| **Site MRS** | | | | | | **2.8** |

Detail: [`audits/mczaykowski.com.json`](./audits/mczaykowski.com.json)

### stripe.com — platform-docs

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---|:---:|:---:|:---:|:---:|:---:|---:|
| find_capability | 3 | 3 | 3 | 3 | 1 | **2.6** |
| integrate_feature | 3 | 3 | 2 | 2 | 1 | **2.2** |
| api_reference | 2 | 3 | 2 | 3 | 2 | **2.4** |
| evaluate_pricing | 3 | 3 | 1 | 2 | 1 | **2.0** |
| **Site MRS** | | | | | | **2.3** |

Detail: [`audits/stripe.com.json`](./audits/stripe.com.json)

### linear.app — platform-docs

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---|:---:|:---:|:---:|:---:|:---:|---:|
| find_capability | 3 | 3 | 3 | 3 | 1 | **2.6** |
| integrate_feature | 3 | 3 | 2 | 2 | 1 | **2.2** |
| api_reference | 3 | 3 | 3 | 3 | 2 | **2.8** |
| evaluate_pricing | 3 | 3 | 2 | 2 | 1 | **2.2** |
| **Site MRS** | | | | | | **2.45** |

Detail: [`audits/linear.app.json`](./audits/linear.app.json)

### vercel.com — platform-docs

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---|:---:|:---:|:---:|:---:|:---:|---:|
| find_capability | 3 | 3 | 3 | 3 | 2 | **2.8** |
| integrate_feature | 3 | 3 | 3 | 2 | 2 | **2.6** |
| api_reference | 3 | 3 | 3 | 3 | 2 | **2.8** |
| evaluate_pricing | 3 | 3 | 2 | 2 | 2 | **2.4** |
| configure_domain_or_env | 3 | 3 | 2 | 2 | 2 | **2.4** |
| **Site MRS** | | | | | | **2.6** |

Detail: [`audits/vercel.com.json`](./audits/vercel.com.json)

### platform.claude.com/docs — AI-platform-docs

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---|:---:|:---:|:---:|:---:|:---:|---:|
| find_capability | 3 | 3 | 3 | 3 | 2 | **2.8** |
| integrate_feature | 3 | 3 | 2 | 2 | 2 | **2.4** |
| api_reference | 3 | 3 | 3 | 3 | 2 | **2.8** |
| evaluate_pricing | 3 | 3 | 3 | 2 | 2 | **2.6** |
| verify_safety_or_policy | 3 | 3 | 2 | 2 | 2 | **2.4** |
| select_model_for_task | 3 | 3 | 3 | 2 | 2 | **2.6** |
| **Site MRS** | | | | | | **2.6** |

Detail: [`audits/platform.claude.com.json`](./audits/platform.claude.com.json)

## What would move the field

1. **Universal trust packets.** Add `content_hash`, `last_modified`, `schema_version`, source/build ID, and `breaking_changes_since` to every agent-readable artifact.
2. **Declared mission sets.** A platform should name a few jobs an agent can attempt instead of making agents infer missions from a docs taxonomy.
3. **Machine-readable API contracts.** Link OpenAPI, GraphQL SDL, SDK schema, or generated JSON contracts from `/llms.txt`.
4. **Typed pricing JSON.** Pricing tables are useful, but agents need stable plan IDs, feature entitlements, token classes, multipliers, and `updated_at`.
5. **Eval-as-contract.** Provide a non-side-effecting validation endpoint or fixture set so agents can prove integration behavior without live credentials.

## Methodology changes now captured in v0.2

- `pattern` is required.
- `source_urls` is required.
- `auth_required` should be recorded per mission.
- `ai-platform-docs` is recognized as a subtype/pattern.
- `Verify` evidence should distinguish freshness, authority, and success-contract proof.
- HTTP headers are partial Verify credit; trust packets and runnable evals are stronger.

## Limitations

- The audit set is still small: one principal, three platform-docs sites, one AI-platform-docs site.
- Platform scores use synthetic default mission sets when missions are not declared.
- Completion scores do not use private credentials or perform side-effecting actions.
- Auth-gated systems can be reachable in principle while still impossible to fully complete in a public unauthenticated audit.
- Scoring is calibrated by working examples, not yet by inter-rater reliability at scale.

## Repository

```text
.
├── README.md
├── brief.md
├── targets.md
├── reviews/
│   └── codex-adversarial-review.md
└── audits/
    ├── linear.app.json
    ├── mczaykowski.com.json
    ├── platform.claude.com.json
    ├── stripe.com.json
    └── vercel.com.json
```
