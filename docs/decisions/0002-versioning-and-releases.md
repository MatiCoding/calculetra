# 2. Version the app and release every merge to main

- Status: Accepted. The deploy trigger is superseded by [0003](0003-deploy-on-release.md) and the release on every merge by [0005](0005-merge-without-release.md)
- Date: 2026-10-19

## Context

Vercel deploys `main` automatically on every merge, but the app had no versions. It was not possible to tell which version was in production or what had changed between two deploys, and players had no list of changes.

The project is maintained by one student, so the process has to be simple and use what is already in place: GitHub, the Vercel deploy on `main` and Conventional Commits.

## Decision

- Versions follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`). While the major version is `0`, anything may change.
  - Each completed milestone is a new minor version (`0.2.0`, `0.3.0`...).
  - Fixes to a published version are a patch version (`0.1.1`).
  - `1.0.0` will be released when Cifras and Letras are stable.
- Every merge from `developer` into `main` is a release:
  1. A `chore: release vX.Y.Z` commit updates the version in `package.json` and adds the changes to `CHANGELOG.md`.
  2. After merging, `main` gets an annotated tag `vX.Y.Z`.
  3. A GitHub Release is published from that tag, with that version's section of the changelog.
- Hotfixes are patch releases and follow the same steps.
- Releases without a suffix (`v0.1.0`) are normal releases and become *Latest* on GitHub, including the `0.x` ones.
- A GitHub *pre-release* is only used for test versions with a suffix (`v1.0.0-rc.1`, `v0.4.0-beta.1`). They are tagged on `developer`, are not merged into `main`, and are tested on Vercel's preview deployment of that branch.
- `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Changes are added under `[Unreleased]` in the same pull request that makes them.

The steps are described in the [contribution guide](https://github.com/MatiCoding/calculetra/blob/main/CONTRIBUTING.md#releases).

## Alternatives considered

- **Mark every `0.x` release as a pre-release**: the `0.` already says the app is unstable, so it would add nothing. GitHub would also never show a *Latest* release on the repository page.
- **Deploy only when a GitHub Release is published** (a GitHub Action with the Vercel CLI, instead of the automatic deploy on `main`): ties deploys to releases explicitly, but needs a Vercel token in GitHub secrets and a new workflow to maintain. Treating every merge into `main` as a release gives the same result with no extra setup.
- **No versions** (continuous deploy without tags): no extra work, but it keeps the problem described in the context.

## Consequences

- The version in production is always the latest release, and the changelog explains what changed between versions.
- Merging into `main` is no longer a quick way to deploy: every merge needs a version, a changelog entry, a tag and a GitHub Release.
- Changes waiting in `developer` are not deployed until the next release.
- `CHANGELOG.md` has to be kept up to date in every pull request, or it will have to be rebuilt from the commits at release time.
