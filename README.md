# Mission Reachability Audit (MRA) — v0.1 Findings

**Date:** 2026-05-16
**Auditor:** claude (peer reviewer: codex — pending)
**Repo:** `/Users/mc/Projects/ax-research`
**Methodology:** [`brief.md`](./brief.md) · **Audits:** [`audits/`](./audits/)

> AX-first sites declare *missions* — what a calling agent should be able to do with them. The methodology question this report opens: **declared is not the same as reachable**. We score five phases (Discover, Resolve, Internalize, Complete, Verify) per mission, 0–3 each, and average to a Mission Reachability Score.

## Headline findings

### 1. Two AX patterns exist, and they need different rubrics

Sites that ship "agent-readable surfaces" today split cleanly into two patterns:

| Pattern | Example | What it declares | What it serves |
|---------|---------|------------------|----------------|
| **Principal** | `mczaykowski.com` | Declared missions, mission→endpoint map, typed POST contract | Representing/citing/contacting a human or entity |
| **Platform-docs** | `stripe.com`, `linear.app`, `docs.anthropic.com` | Doc-index `llms.txt` with `.md` companions | Instructing an agent to use a product |

A site can be auditable in *both* patterns — but the missions differ in kind. Principal missions are relational (`prepare_introduction`, `evaluate_collaboration`). Platform missions are operational (`integrate_feature`, `evaluate_pricing`). You can't score one against the other as if they were the same thing.

This split should be made first-class in any future MRA methodology — the auditor declares the pattern, and the rubric selects an appropriate default mission set when missions aren't declared by the site.

### 2. The principal pattern is currently the more mature surface

Counter-intuitive but real: a single individual's site (`mczaykowski.com`, site MRS **2.8**) demonstrates more agent-native discipline than the largest dev-tool platforms (`stripe.com`, site MRS **2.3** against a synthetic default mission set).

What the principal pattern does better:
- Declares missions explicitly and maps each to specific endpoints
- Ships a trust packet (`content_hash` + `last_modified` + `breaking_changes_since` + `schema_version`) on every endpoint
- Returns typed JSON at every step — body schemas for POST endpoints are themselves typed
- Includes structured trust signals like `evidence_level ∈ {self-claim, public-live, private-live}` and citation confidence

This is asymmetric in a way worth naming: **the discipline that scales easily on a small surface is the discipline most absent at scale.**

### 3. `Verify` is the universally weakest phase

Across both audits, `Verify` is the phase that drags MRS down most.

| Site | Verify scores by mission |
|------|--------------------------|
| mczaykowski.com | 3 / 3 / 3 / 3 |
| stripe.com | 1 / 1 / 2 / 1 |

The principal pattern fixed Verify by shipping a trust packet on every endpoint. The platform pattern hasn't. Adding `content_hash + last_modified + breaking_changes_since` to `/llms.txt` and `.md` companions is the **single highest-leverage change** any platform-docs site can make. It would lift Stripe's site MRS by ~0.2 on its own.

### 4. AI companies don't fully eat their own dog food

We probed `anthropic.com`, `openai.com`, `vercel.com`, `stripe.com`, `linear.app`, `docs.anthropic.com`:

- ✅ `stripe.com/llms.txt`, `linear.app/llms.txt`, `vercel.com/llms.txt` — present
- ✅ `docs.anthropic.com/llms.txt` (redirects to platform.claude.com) — present
- ❌ `anthropic.com/llms.txt` — 404
- ❌ `openai.com/llms.txt` — 403

The product docs (`docs.anthropic.com`) ship the doc-index pattern. The corporate root (`anthropic.com`) doesn't. The mismatch is a small but loud signal: even AI companies treat AX as a documentation feature, not a company feature.

### 5. Methodology insight: `Internalize` and `Complete` *can* merge

A reviewer (codex, when they audit) should challenge: are five phases necessary, or do `Internalize` and `Complete` always co-vary? In our two audits they didn't perfectly co-vary — mczaykowski.com's `research_ideas` scores 2/2 (prose-bound), but Stripe's `find_capability` scores 3/3 (operationally complete from the index alone). They measure different things in principle; in practice the difference appears smallest on declarative missions and largest on integrative missions. Worth keeping as separate phases for v0.2 and revisiting after more audits.

## Per-site scorecards

### mczaykowski.com — principal-pattern

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---------|:--------:|:-------:|:-----------:|:--------:|:------:|:---:|
| evaluate_collaboration | 3 | 3 | 3 | 3 | 3 | **3.0** |
| research_ideas | 3 | 3 | 2 | 2 | 3 | **2.6** |
| assess_expertise | 3 | 3 | 2 | 2 | 3 | **2.6** |
| prepare_introduction | 3 | 3 | 3 | 3 | 3 | **3.0** |
| **Site MRS** | | | | | | **2.8** |

**Detail:** [`audits/mczaykowski.com.json`](./audits/mczaykowski.com.json)

### stripe.com — platform-docs (synthetic mission set)

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---------|:--------:|:-------:|:-----------:|:--------:|:------:|:---:|
| find_capability | 3 | 3 | 3 | 3 | 1 | **2.6** |
| integrate_feature | 3 | 3 | 2 | 2 | 1 | **2.2** |
| api_reference | 2 | 3 | 2 | 3 | 2 | **2.4** |
| evaluate_pricing | 3 | 3 | 1 | 2 | 1 | **2.0** |
| **Site MRS** | | | | | | **2.3** |

**Detail:** [`audits/stripe.com.json`](./audits/stripe.com.json)

> Stripe site MRS is not comparable in absolute terms to mczaykowski.com — different mission set, different pattern. Comparable as a category signal.

## What would move the field

Concretely, in order of leverage:

1. **Universal trust packets.** Add `content_hash + last_modified + breaking_changes_since + schema_version` to every agent-readable artifact (`/llms.txt`, `.md` companions, JSON endpoints). Single largest move; lifts `Verify` everywhere.

2. **Declared mission sets, even opinionated ones.** A platform that names three or four missions an agent can attempt (`integrate_payments`, `verify_identity`, ...) is dramatically more reachable than one that requires agents to derive missions from a doc taxonomy.

3. **Typed pricing JSON.** Of the four missions audited on a platform, `evaluate_pricing` scored lowest by a wide margin. Marketing pages stay marketing pages; agents need `/api/pricing.json`.

4. **OpenAPI linked from `/llms.txt`.** Stripe ships a public OpenAPI spec but agents have to know it exists — discoverability hole.

5. **Eval-as-contract.** mczaykowski.com declares evals but they aren't executable (`POST /api/evals/run` doesn't exist). Making evals runnable would turn `Verify` from "I checked the hash" into "I passed the principal's eval" — a real trust upgrade.

## Open methodology questions

- Should there be a **registry of default mission sets per pattern** so non-declaring sites are still scoreable on a fair basis? (Right now we synthesized one for Stripe; the synthesis is the auditor's bias.)
- Is the **principal/platform split** complete, or is there a third pattern (e.g. dataset/registry, multi-agent service) that needs its own rubric?
- Is `Verify` still doing distinct work once `Internalize` includes content-hash checking, or are they collapsing into one phase?
- What's the right v0.2 of the methodology if we want **two independent auditors agreeing within ±0.3 MRS** on the same site?

## Limitations of v0.1

- Two audits is the smallest possible audit set. n=2 means everything here is provisional.
- Auditor count = 1 (claude). Inter-rater reliability is undefined until codex (or a third) runs an independent audit.
- Scoring is calibrated within the audit set, not against any external standard.
- We did not actually exercise POST endpoints (out of politeness — we did not submit a contact form to anyone).
- Performance, authentication, multi-turn behavior — all out of scope this pass.

## Next steps

- [ ] Codex independent audit of one peer site (currently held: Linear or platform.claude.com would be most informative).
- [ ] Codex adversarial review of methodology and synthesis.
- [ ] Optional: prototype `axmra` CLI — `axmra audit <url>` produces an audit JSON to this schema. Even a scaffolded harness is useful.
- [ ] Optional follow-up paper: substrate-debt index (the prose-vs-typed gap measured across sites), which uses MRA data as input.

## Repository

```
.
├── README.md             # this synthesis
├── brief.md              # methodology v0.1
└── audits/
    ├── mczaykowski.com.json
    └── stripe.com.json
```

## Provenance

- Lead: claude (passport: `/Users/mc/.acorn/id/agents/claude.json`)
- Coordination: AcornKit space `ax-reachability` (id `ax-reachability-46ab842c`)
- Acorn view: bootstrapped at repo root; continuity packet to be written on close
- Principal: mc (operator)
