# Codex adversarial review — MRA v0.1

Date: 2026-05-25
Reviewer: codex

## Bottom line

The principal-vs-platform split is the right first cut. I would keep `Internalize` and `Complete` separate for v0.2, but rename or sharpen `Complete`: right now it mixes "can answer the mission" with "can perform side effects in the real world." That matters because platform-docs missions often become auth-gated at completion time.

## Rubric stress-test

The five phases hold up:

- `Discover` and `Resolve` are distinct and useful. A site can link a surface clearly but serve a bad or non-agent response.
- `Internalize` and `Complete` should stay separate. Linear's API reference is strongly internalizable from GraphQL SDL, while integration completion is still gated by auth, setup, and absent evals.
- `Verify` does real work, but it should be defined as "verify source authority/freshness" rather than "verify task success." A runnable eval endpoint is stronger than a hash, but they are different verification layers.

Suggested v0.2 tweak: split `Verify` evidence into `freshness` and `success_contract` companion fields, while keeping one 0-3 score for now.

## Synthesis push-back

The "AI companies don't fully eat their own dog food" claim is directionally fair but too broad for n=2 plus discovery probes. A tighter version is stronger: "AX currently lives in product-doc surfaces, not corporate-root surfaces." That avoids sounding like a cheap shot while preserving the important observation.

The principal/platform split is not overfit; Linear reinforces the platform-docs pattern. Its surface is more agent-aware than Stripe in developer affordances because it links GraphQL SDL and an MCP server, but it still lacks declared missions and trust packets.

## Independent audit result

I added `audits/linear.app.json`.

Linear site MRS: 2.45

Per-mission:

| Mission | Discover | Resolve | Internalize | Complete | Verify | MRS |
|---|---:|---:|---:|---:|---:|---:|
| find_capability | 3 | 3 | 3 | 3 | 1 | 2.6 |
| integrate_feature | 3 | 3 | 2 | 2 | 1 | 2.2 |
| api_reference | 3 | 3 | 3 | 3 | 2 | 2.8 |
| evaluate_pricing | 3 | 3 | 2 | 2 | 1 | 2.2 |

Interpretation: Linear is a stronger platform-docs case than Stripe for `api_reference` because the raw GraphQL SDL is directly linked and machine-parseable. It has the same structural weakness on `Verify`: no trust packet on `/llms.txt` or Markdown companions.

## Methodology changes I would make

1. Add a required `pattern` field to every audit JSON.
2. Add a required `source_urls` array so later reviewers can reproduce evidence.
3. Define a standard platform-docs default mission set before adding more audits.
4. Treat `/llms-full.txt` returning an app shell as a gap, not a partial pass.
5. Track `auth_required` per mission. Auth does not mean unreachable, but it changes what "Complete" can mean in an unauthenticated audit.

## Next useful audit

Run `platform.claude.com/docs` next. It will test whether AI-native platform docs improve the trust-packet and eval-contract story, or whether Linear's more operational developer surface is already ahead.
