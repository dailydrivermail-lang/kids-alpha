# Kid's Alpha — instructions for Claude Code

1. Read `SPEC.md` in full at the start of every session. It is the source of truth.
2. Work one slice at a time (SPEC.md section 12). Never start a later slice early.
3. Finish a slice, deploy it, report, and stop.
4. If SPEC.md is unclear or contradicts itself, ask before building.
5. The simulation engine must be pure, deterministic and unit-tested.
6. Never add buy or sell advice anywhere in the product.
7. Secrets (API keys) go in environment variables / Wrangler secrets, never in the repo.

Slice status is tracked in `docs/`. Slice 0 findings: `docs/slice-0-price-data.md`.
