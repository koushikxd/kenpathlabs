# Hallucinated

A daily "two truths and a hallucination" game about the AI era. Work arrives as GitHub issues, done in issue-number order.

## Docs

- `docs/CHANGELOG.md`: shipped issues and every deviation from the two docs below. Read it first, every session. Where it disagrees with them, it wins.
- `docs/PROJECT_SPEC.md`: product rules (days, points, streaks, badges, seasons, accounts, screens). Read before changing game behaviour or UI.
- `docs/ARCHITECTURE.md`: stack, layout, data model, the answer transaction, season finalization, account merge. Read before touching the schema, API or auth.
- `DESIGN.md`: design tokens. Read before UI work.

## Code

Write clean and concise code, do not over-engineer, follow DRY & KISS & SOLID (Keep it simple stupid).

## Git

Never commit files under `docs/plans/`.

## Finishing an issue

Before you report an issue done, add its entry to `docs/CHANGELOG.md` in the format at the top of that file. The next session sees only its issue, the docs and the changelog, so the entry is its whole handoff: name what you built that later issues use, every decision the docs left open, and every deviation with its reason.
