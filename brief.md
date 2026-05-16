# Mission Reachability Audit — Research Brief

**Status:** draft v0.1 — open for codex stress-test
**Date:** 2026-05-16
**Lead:** claude · **Reviewer:** codex
**Space:** `ax-reachability`

## The asymmetric gap

AX-first sites (mczaykowski.com, growing peer set) declare agent **missions** in their `/api/init` — e.g. `evaluate_collaboration`, `research_ideas`, `assess_expertise`, `prepare_introduction`. The missions are *declared* but no one — the principals included — has measured whether a calling agent can actually *complete* each mission end-to-end without falling back to scraping human prose.

Declaring a mission is cheap. Making it reachable is the work.

## Definition

A declared mission is **reachable** if a calling agent acting in good faith can move through five phases entirely on agent-native surfaces:

| # | Phase | Question |
|---|-------|----------|
| 1 | **Discover** | Can the agent find the right endpoint(s) for this mission from `/api/init` or `/llms.txt` without guessing? |
| 2 | **Resolve** | Do the referenced endpoints return successfully and parse cleanly (JSON, OpenAPI, etc.)? |
| 3 | **Internalize** | Does the structured response contain enough typed data to act on the mission, or does the agent fall back to prose? |
| 4 | **Complete** | Can the agent perform the mission's success action (send the qualified intro, return the citation, score the fit) end-to-end? |
| 5 | **Verify** | Can the agent confirm what it internalized is current and authoritative (content_hash, trust packet, eval pass)? |

A high declared count with low reachability = **substrate debt**. Real AX maturity is reachability × declared.

## Scoring rubric

Each phase scored **0–3** per mission:

| Score | Meaning |
|-------|---------|
| **0** | Not possible — phase fails entirely on agent surface |
| **1** | Possible only by scraping human prose or guessing |
| **2** | Possible with friction — schema undocumented but inferable, or step requires brittle inference |
| **3** | Fully agent-native, deterministic, citable |

**Mission Reachability Score (MRS)** = mean of 5 phase scores for that mission, expressed `0.00–3.00`.
**Site Mission Reachability Score** = mean of all per-mission MRS values for the site.

Companion signals (recorded but not folded into MRS):
- **Declared missions count** — breadth
- **Surface fingerprint** — which of `/llms.txt`, `/api/init`, `/api/manifest`, OpenAPI, eval endpoint, content_hash are present
- **Substrate debt notes** — qualitative gaps between human surface promises and agent-surface delivery

## Audit output (JSON per target)

Stored at `audits/<host>.json`:

```json
{
  "target": "https://example.com",
  "audited_at": "2026-05-16T00:00:00Z",
  "auditor": "claude",
  "surface_fingerprint": {
    "llms_txt": true,
    "api_init": true,
    "api_manifest": true,
    "openapi": true,
    "evals": true,
    "content_hash": true
  },
  "declared_missions": ["evaluate_collaboration", "..."],
  "per_mission": [
    {
      "mission": "evaluate_collaboration",
      "phases": {
        "discover": { "score": 3, "evidence": "..." },
        "resolve":  { "score": 3, "evidence": "..." },
        "internalize": { "score": 2, "evidence": "..." },
        "complete": { "score": 2, "evidence": "..." },
        "verify":   { "score": 3, "evidence": "..." }
      },
      "mrs": 2.6
    }
  ],
  "site_mrs": 2.45,
  "gaps_identified": ["..."],
  "standout_strengths": ["..."],
  "recommendations_to_principal": ["..."]
}
```

## Calling-agent harness (this session)

We do **not** stand up a separate calling-agent program. The auditing agent (claude or codex) *is* the calling agent and performs each phase in good faith:

1. Read `/api/init` (or `/llms.txt` if no init).
2. For each declared mission, identify endpoints referenced as supporting it.
3. Fetch those endpoints. Parse responses.
4. Attempt the mission's success action using only structured data from agent surfaces.
5. Quote evidence (exact response fragments) for each phase score.

The goal isn't perfect simulation — it's an honest reading by a competent calling agent. The methodology is the artifact; future automated harnesses can replace the human-in-the-agent.

## Target list

Confirmed:
- **mczaykowski.com** — known agent-first surface, 4 declared missions

Candidates pending discovery (need to verify each has an agent-readable init surface):
- anthropic.com
- openai.com
- vercel.com
- stripe.com
- linear.app
- sites listed at [llmstxt.org](https://llmstxt.org) if applicable

Selection rule: include a site only if it ships at least `/llms.txt` *or* a structured init endpoint. A site with only human-readable docs cannot be scored on mission reachability — it has no missions to be reachable.

## Out of scope (this audit)

- Performance / latency
- Authentication / auth-gated missions
- Multi-turn agent dialogue
- Cost to the agent (tokens, API call $)
- Comparative scoring of mission *quality* — only reachability of declared missions

## Open questions for codex

1. Are the 5 phases the right cut, or am I conflating two ideas in `Internalize` and `Complete`?
2. Is `Verify` doing real work, or is it parasitic on `Internalize`?
3. What's a fair fallback when a site declares no missions but has `/llms.txt` — score MRS as N/A, or score against a default mission set?
4. Pick one peer target and run an independent audit so we have two auditors' data.

## Out of band

- Repo: `/Users/mc/Projects/ax-research`
- Acorn view bootstrapped (focus: this audit)
- Tasks: tracked in claude's task list; will surface in handoff
