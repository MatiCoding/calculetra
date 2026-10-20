# Contributing to Calculetra

Thanks for wanting to help! This guide explains how to propose a change. To understand what the project is and how it is built, read the [README](README.md) and the [architecture document](docs/architecture.md) first.

## Reporting a bug or proposing a feature

Use the issue templates when you open a [new issue](https://github.com/MatiCoding/calculetra/issues/new/choose):

- **Bug report**: something does not work as expected. Explain what happened, the steps to reproduce it and what you expected instead.
- **Feature request**: a new feature or an improvement. Explain what you want and how we will know it is done (acceptance criteria).

Please open an issue before starting any non-trivial change, so we can agree on it before you spend time on the code. The maintainer adds the area labels (`cifras`, `letras`, `core`, `infra`, `documentation`).

## Workflow

The repository has two long-lived branches:

- `main` only receives changes that are finished and ready to be published, from `developer` or from a hotfix. Merging into `main` does not deploy anything: production is the latest published release (see [Releases](#releases)).
- `developer` is where changes are integrated before they go to `main`.

To propose a change:

1. [Fork the repository](https://github.com/MatiCoding/calculetra/fork) and clone **your fork**:

   ```bash
   git clone https://github.com/<your-user>/calculetra.git
   cd calculetra
   ```

2. Add the original repository as `upstream`, so you can bring in new changes:

   ```bash
   git remote add upstream https://github.com/MatiCoding/calculetra.git
   ```

3. Create your branch from the latest `developer`. Name it `<type>/<issue>-<short-description>`:

   ```bash
   git fetch upstream
   git switch -c feat/42-letters-board upstream/developer
   ```

4. Commit your changes (see [Commit messages](#commit-messages)), push the branch to your fork and open a pull request **to `developer`**:

   ```bash
   git push -u origin feat/42-letters-board
   ```

5. If `developer` moves on while you work, merge it into your branch:

   ```bash
   git fetch upstream
   git merge upstream/developer
   ```

If your change is something a player will notice, add a line to the `[Unreleased]` section of [`CHANGELOG.md`](CHANGELOG.md) in the same pull request (under `### Added`, `### Changed` or `### Fixed`). Internal changes such as tests, CI or refactors do not need one.

CI runs lint, tests and build on every pull request. A pull request needs a green CI run before it is merged.

### Merging into main

The maintainer merges `developer` into `main` when the changes in it are finished and ready to be published. It does not have to be a release:

1. Open a pull request from `developer` to `main` with a title that summarizes what it brings, for example `Merge session security changes`.
2. Merge it when CI is green. The version and `CHANGELOG.md` do not change: the entries stay under `[Unreleased]` until the next release.
3. Bring `main` back into `developer` (`git switch developer && git merge main && git push`).

Several merges can go into `main` before a release. The reasons are in [ADR 0005](docs/decisions/0005-merge-without-release.md).

### Hotfixes

Only for an urgent bug in production: create the branch from `main` and open the pull request to `main`. After it is merged, `main` is merged into `developer` so both branches have the fix.

A hotfix is a patch release (for example `v0.1.1`): add the fix under `### Fixed` in `CHANGELOG.md`, and add the `chore: release vX.Y.Z` commit (steps 1–3 of [Releases](#releases)) to the hotfix branch itself, so the hotfix pull request is the release. Then tag, publish and merge back as in steps 4–6. The release also includes any unreleased changes already in `main`.

## Releases

Releases are made by the maintainer, when they decide to publish what is in `main`. Versions follow [Semantic Versioning](https://semver.org/). The reasons are in [ADR 0002](docs/decisions/0002-versioning-and-releases.md) and [ADR 0005](docs/decisions/0005-merge-without-release.md).

### Which version

- **Minor** (`0.2.0`): a milestone is complete or there are new features.
- **Patch** (`0.1.1`): only fixes to the published version, including hotfixes.
- **Major** (`1.0.0`): reserved for when Cifras and Letras are stable.

A version without a suffix is a normal release and is marked as *Latest* on GitHub. Only test versions with a suffix (`v1.0.0-rc.1`, `v0.4.0-beta.1`) are published as a *pre-release*: they are tagged on `developer`, tested on its Vercel preview deployment and never merged into `main`.

### Steps

1. On `developer`, set the new version in `package.json` and `package-lock.json` without creating a commit or a tag:

   ```bash
   npm version 0.2.0 --no-git-tag-version
   ```

2. In `CHANGELOG.md`:
   - Rename `## [Unreleased]` to `## [0.2.0] - YYYY-MM-DD` and add a new, empty `## [Unreleased]` above it.
   - Update the links at the bottom: `[Unreleased]` compares from the new tag, and the new version compares with the previous one.

   ```md
   [Unreleased]: https://github.com/MatiCoding/calculetra/compare/v0.2.0...HEAD
   [0.2.0]: https://github.com/MatiCoding/calculetra/compare/v0.1.0...v0.2.0
   ```

3. Commit both files as `chore: release v0.2.0`, push and open a pull request from `developer` to `main` titled `Release v0.2.0`. Merge it when CI is green.

4. Tag the merge on `main` with an annotated tag and push the tag (`git push` does not push tags):

   ```bash
   git switch main
   git pull
   git tag -a v0.2.0 -m "v0.2.0: <short summary>"
   git push origin v0.2.0
   ```

5. On GitHub, go to **Releases → Draft a new release**, choose the tag, use the version as the title and paste only that version's section of the changelog. Leave *Set as a pre-release* unchecked and publish it.

6. Bring `main` back into `developer`:

   ```bash
   git switch developer
   git merge main
   git push
   ```

Publishing the release in step 5 is what deploys it: the **Deploy** workflow sends that tag to Vercel production and the **Docs** workflow publishes the documentation site. Merging into `main` deploys nothing on its own, and pre-releases are never deployed to production.

### Deploying an older version

To go back to a previous version, open **Actions → Deploy → Run workflow** on GitHub and enter its tag (for example `v0.1.1`). It deploys that tag to production without changing `main`. Then fix the problem and publish a new patch release.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org): `<type>(<optional scope>): <description>`, in English, in the imperative ("add", not "added") and without a final period.

| Type       | When to use it                                   | Example                                         |
| ---------- | ------------------------------------------------ | ----------------------------------------------- |
| `feat`     | A new feature                                    | `feat: calculate score`                         |
| `fix`      | A bug fix                                        | `fix: draw each number at most once`            |
| `style`    | Visual changes: CSS, layout, animations          | `style(cifras): show selected tile and operator`|
| `refactor` | Code changes that do not change behaviour        | `refactor: group auth files into folders`|
| `test`     | Adding or changing tests only                    | `test: expect no repeat numbers`                |
| `docs`     | Documentation only                               | `docs: add game rules`                          |
| `ci`       | Changes to the GitHub Actions workflows          | `ci: run checks on pull requests to developer`  |
| `chore`    | Anything else (config, dependencies, comments)   | `chore: add VITE_UNDER_CONSTRUCTION to .env.example` |

Reference the issue in the commit body: `Refs #42` while you are working on it, and `Closes #42` in the last commit. GitHub closes the issue when that commit reaches `main`, even if it has not been released yet. Note that `Closes #42` in the description of a pull request to `developer` does **not** close the issue.

## Before opening a pull request

Run the same checks as CI (Node.js 22 or later):

```bash
npm ci
npm run lint
npm test
npm run build
npm run docs:build
```

If any of them fails, CI will fail too. See [Available scripts](README.md#available-scripts) in the README for what each command does.

## Code conventions

- **Game logic** goes in `src/domain`, as plain TypeScript with no React imports, and every module has its tests next to it (`score.ts` → `score.test.ts`).
- **New components** go in their own folder, `src/components/Name/`, with `Name.tsx`, a test in `Name.test.tsx` and its styles in a CSS Module, `Name.module.css`.
- Tests use [Vitest](https://vitest.dev), and components are tested with [Testing Library](https://testing-library.com).
- For testing, accessibility and styling details, see [Cross-cutting concepts](docs/architecture.md#8-cross-cutting-concepts) in the architecture document.

## Working without Supabase keys

Accounts use [Supabase](https://supabase.com), which needs two environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

- **Without keys**, `npm run lint`, `npm test` and `npm run build` work: the tests mock Supabase and CI runs without any keys. You can work on the game logic and the components and pass CI.
- **`npm run dev` needs keys.** The Supabase client throws an error when it loads if the variables are missing, so the app does not start.

To run the app locally, create a free Supabase project, copy `.env.example` to `.env` and fill in the URL and the publishable key from your project settings. Never commit your `.env` file (it is already in `.gitignore`).
