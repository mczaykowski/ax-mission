# AX MRA target list

Status: draft target matrix
Last checked: 2026-05-25
Owner: codex

This list is for choosing the next Mission Reachability Audit targets. The goal is variety, not a leaderboard. A useful batch should include different AX patterns, different artifact sizes, and at least one negative or partial control.

## Selection principles

- Prefer targets with an agent-readable surface: `/llms.txt`, `/api/init`, OpenAPI, GraphQL SDL, MCP, or structured docs.
- Keep pattern diversity: principal, platform-docs, API reference, protocol/spec, commerce/pricing, enterprise cloud, and negative control.
- Avoid auditing only developer-tool companies. That would overfit the rubric to docs indexes.
- Include at least one site where the agent surface exists but is huge, one where it is narrow and typed, one where it redirects, and one where the corporate root is worse than product docs.
- Record current status before scoring. Agent surfaces are moving quickly.

## Recommended and recent batch

| Priority | Target | Pattern | Current surface signal | Why audit it | Suggested mission set |
|---:|---|---|---|---|---|
| 1 | `platform.claude.com/docs` | AI platform-docs | `/docs/llms.txt` resolves via `docs.anthropic.com/llms.txt` redirect; large multilingual docs index; `llms-full.txt` advertised | Best next comparison for Linear: AI-native docs with tools, skills, MCP, API references, and admin APIs | `find_capability`, `integrate_feature`, `api_reference`, `evaluate_pricing`, `verify_safety_or_policy` |
| 2 | `developers.openai.com/api/docs` | AI platform-docs | `platform.openai.com/docs/llms.txt` redirects to `developers.openai.com/api/docs/llms.txt`; corporate `openai.com/llms.txt` returned 403 | Tests the corporate-root vs product-doc split directly, using another AI-native platform | Same as Claude docs, plus `select_model_for_task` |
| 3 | `vercel.com` | platform-docs / deployment platform | Audited 2026-05-25. `/llms.txt`, `/docs/llms-full.txt`, and OpenAPI resolve; site MRS 2.60 | Completed deployment-platform baseline: deployment workflows, framework docs, runtime choices, pricing, and auth-gated completion | `find_capability`, `integrate_feature`, `api_reference`, `evaluate_pricing`, `configure_domain_or_env` |
| 4 | `developers.cloudflare.com` | infrastructure docs | `docs.cloudflare.com/llms.txt` redirects to `developers.cloudflare.com/llms.txt`; 200 with ETag | Enterprise infra surface with many products; good stress test for discoverability and scope control | `find_capability`, `configure_worker`, `api_reference`, `evaluate_pricing_or_limits` |
| 5 | `docs.github.com` | developer platform docs | `/llms.txt` returns 200 Markdown | Tests docs for a platform where API, CLI, Actions, webhooks, and auth docs intersect | `find_capability`, `automate_workflow`, `api_reference`, `configure_auth` |
| 6 | `docs.aws.amazon.com` | hyperscale cloud docs | `/llms.txt` returns 200; very large artifact with `Last-Modified` and `ETag` | Stress test for huge corpus navigation and whether headers meaningfully help Verify | `find_capability`, `choose_service`, `api_reference`, `estimate_cost_or_limits` |
| 7 | `shopify.dev` | commerce platform docs | `/llms.txt` returns 200; commerce/admin/API docs | Adds non-dev-tool commercial domain with pricing, storefront/admin APIs, app platform docs | `find_capability`, `build_app`, `api_reference`, `evaluate_plan_fit` |
| 8 | `modelcontextprotocol.io` | protocol/spec docs | `/llms.txt` returns 200 and has `Last-Modified`; spec-oriented | Tests whether MRA needs a third pattern for protocols/standards, not products or principals | `understand_protocol`, `implement_server`, `implement_client`, `verify_compliance` |

## Control and calibration targets

| Target | Pattern | Current surface signal | Use |
|---|---|---|---|
| `api.mczaykowski.com/api/init` | principal | 200 JSON. `mczaykowski.com/api/init` now tells agents to start at this API host. | Re-run as a principal-pattern control after v0.2 schema changes. This catches API-location drift and keeps one high-discipline principal baseline. |
| `stripe.com` / `docs.stripe.com` | platform-docs | Already audited. `docs.stripe.com/llms.txt` returns 200. | Keep as platform-docs baseline. Revisit only after schema changes. |
| `linear.app` | platform-docs + MCP | Already audited. `/llms.txt` returns 200; GraphQL SDL is linked; MCP docs exist. | Keep as the strongest current platform-docs comparison for API reference. |
| `anthropic.com` corporate root | corporate-root negative / partial | `anthropic.com/llms.txt` redirects to `www.anthropic.com/llms.txt`; prior v0.1 probing found corporate root weaker than product docs. | Use only as a root-vs-product-docs contrast, not a full MRS target unless an agent surface is present. |
| `openai.com` corporate root | corporate-root negative / partial | `openai.com/llms.txt` returned 403 during this probe; product docs redirect exists separately. | Use as a negative/partial control for agent access at corporate root. |
| `www.gov.uk` | public-service negative / partial | `/llms.txt` returned 404. | Useful later if we broaden MRA beyond developer docs, but not scoreable under v0.1 selection rules. |

## Backlog by variety bucket

### AI-native platforms

- `platform.claude.com/docs`
- `developers.openai.com/api/docs`
- `docs.cursor.com` / `cursor.com`

Why: tests whether AI vendors expose agent surfaces as first-class product contracts or just documentation indexes.

### Developer platforms and infrastructure

- `vercel.com`
- `developers.cloudflare.com`
- `docs.github.com`
- `docs.aws.amazon.com`
- `supabase.com`

Why: broad operational missions, auth-gated completion, pricing/limits, SDK/API references.

### Commerce and business platforms

- `shopify.dev`
- `docs.stripe.com`
- Candidate to find: one CRM/support platform with `/llms.txt` or OpenAPI.

Why: gives non-infra business missions such as plan fit, admin API usage, storefront or workflow integration.

### Protocols, registries, and standards

- `modelcontextprotocol.io`
- Candidate to find: OpenAPI Initiative, Schema.org, or W3C surface if agent-readable.

Why: likely third pattern. Missions are not "use this product" or "represent this principal"; they are "understand and implement a spec."

### Principals

- `api.mczaykowski.com/api/init`
- Candidate to find: at least two more personal/company-principal sites with explicit `/api/init`-style missions.

Why: current methodology has only one principal-pattern example. More principal targets are needed before claiming the pattern is mature.

### Negative and partial controls

- `openai.com`
- `anthropic.com`
- `www.gov.uk`
- Candidate to find: a high-quality public documentation site with no agent-readable entrypoint.

Why: controls prevent the report from silently assuming every well-designed site is AX-ready.

## Proposed v0.2 audit order

1. `platform.claude.com/docs` — done
2. `vercel.com` — done
3. `developers.cloudflare.com`
4. `modelcontextprotocol.io`
5. `api.mczaykowski.com/api/init` re-audit

This order gives one AI-native platform, one deployment/product platform, one hyperscale infrastructure docs site, one protocol/spec target, and one principal-pattern control.

## Probe notes

Observed on 2026-05-25 from Warsaw:

- `docs.anthropic.com/llms.txt` returned 301 to `https://platform.claude.com/docs/llms.txt`.
- `platform.openai.com/docs/llms.txt` returned 301 to `https://developers.openai.com/api/docs/llms.txt`.
- `vercel.com/llms.txt`, `docs.github.com/llms.txt`, `developers.cloudflare.com/llms.txt`, `docs.aws.amazon.com/llms.txt`, `shopify.dev/llms.txt`, `supabase.com/llms.txt`, `cursor.com/llms.txt`, and `modelcontextprotocol.io/llms.txt` returned 200.
- `vercel.com` was audited on 2026-05-25. It scored site MRS 2.60, driven by `/docs/llms-full.txt`, per-page `last_updated` metadata, and a public OpenAPI contract at `https://openapi.vercel.sh/`.
- `api.mczaykowski.com/api/init` returned 200 JSON; `mczaykowski.com/api/init` returned a pointer telling agents to use the API host.
- `openai.com/llms.txt` returned 403.
- `www.gov.uk/llms.txt` returned 404.
