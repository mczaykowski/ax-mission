# Contributing

This repo treats the standard as a production contract, not a brainstorm document.

## Change Rules

- Do not add required fields to v0.1 manifests without creating a new version.
- Additive optional fields may be proposed for v0.x, but they must not invalidate current examples.
- Every schema change must include at least one example update.
- Every spec change must be reflected in the validator when statically checkable.
- Research claims should point to an audit file or a dated probe note.

## Local Validation

Run:

```bash
npm test
```

This validates bundled manifests.

To also check research audit fixtures, run:

```bash
npm run test:all
```

Audit fixture warnings are non-fatal when they identify legacy research files that predate the latest audit schema.

## Proposal Format

For a standards change, include:

1. Problem statement
2. Proposed field or rule
3. Why existing fields are insufficient
4. Backward compatibility impact
5. Example manifest fragment
6. Validator or schema changes
