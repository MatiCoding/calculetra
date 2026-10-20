# 5. Merge into main without making a release

- Status: Accepted
- Date: 2026-10-20

## Context

[ADR 0002](0002-versioning-and-releases.md) made every merge from `developer` into `main` a release, because Vercel deployed every push to `main`. Since [ADR 0003](0003-deploy-on-release.md), production is only deployed when a GitHub Release is published, so a merge into `main` no longer reaches players.

Making every merge a release still forces a version, a changelog section, a tag and a GitHub Release for each finished change, even small ones that are better published together.

## Decision

- `main` receives finished changes from `developer` through a pull request whenever they are ready, without making a release. It only receives changes that are ready to be published.
- A release is made when the maintainer decides to publish what is in `main`. The `chore: release vX.Y.Z` commit goes through a `Release vX.Y.Z` pull request from `developer`, and the merge is tagged and published as before.
- Changes merged into `main` stay under `[Unreleased]` in `CHANGELOG.md` until the next release.
- A hotfix is still a patch release. The hotfix branch includes its own `chore: release` commit, so the hotfix pull request is the release. It also publishes any unreleased changes already in `main`, which is safe because `main` only has changes ready to be published.

This replaces the rule "every merge from `developer` into `main` is a release" in ADR 0002. The rest of ADR 0002 and ADR 0003 is still in force.

## Alternatives considered

- **Keep every merge a release** (ADR 0002): `main` always matches production, but every small change needs a full release.
- **Merge into `main` only to release**: `main` still matches production without extra releases, but finished work waits in `developer` and its issues stay open until the release.

## Consequences

- `main` can be ahead of production. Production is the latest published release, not the latest commit on `main`.
- Several changes can be published in a single release.
- Issues are closed when their commit reaches `main`, which can be before they are deployed.
- Anything merged into `main` must be ready to publish, because the next release or hotfix will include it.