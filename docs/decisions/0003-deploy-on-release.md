# 3. Deploy to production when a release is published

- Status: Accepted
- Date: 2026-10-20

## Context

[ADR 0002](0002-versioning-and-releases.md) made every merge into `main` a release, and Vercel deployed every push to `main`. Production matched the latest release only as long as that rule was followed: any merge into `main` was deployed, with or without a version. Going back to an older version meant reverting commits on `main`.

ADR 0002 rejected deploying on release because of the extra setup. Having production be exactly a published tag, and being able to deploy an older one, is now worth that cost.

## Decision

- Vercel's Git integration no longer deploys `main` (`git.deploymentEnabled.main: false` in `vercel.json`). Preview deployments of other branches, such as `developer`, keep working.
- A **Deploy** workflow (`.github/workflows/deploy.yml`) runs when a GitHub Release is published. It checks out the release tag and deploys it to Vercel production with the Vercel CLI (`vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod`).
- The **Docs** workflow also runs when a release is published, instead of on every push to `main`.
- Pre-releases are skipped by both workflows.
- Both workflows can be run by hand. Deploy takes a tag as input, so an older version can be deployed again.
- The workflow uses three repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`. The Supabase variables stay in Vercel and are downloaded by `vercel pull`.

The rest of ADR 0002 (versions, changelog, tags, when a release is a pre-release) is still in force.

## Alternatives considered

- **Keep deploying every push to `main`** (ADR 0002): no secrets and no extra workflow, but production depends on a rule instead of on the release itself, and rolling back needs new commits.
- **Deploy hooks** (a Vercel URL that triggers a deploy): simpler than the CLI, but it always builds the latest commit of a branch, not a given tag, so it cannot deploy an older release.

## Consequences

- Production is always exactly a published release, and the GitHub Release page shows what is deployed.
- Rolling back is running the Deploy workflow with an older tag.
- A merge into `main` without a release deploys nothing, so forgetting to publish the release means the new version never reaches players.
- The Vercel token expires and must be renewed in Vercel and in the `VERCEL_TOKEN` secret. When it expires, deploys fail.
- The `github-pages` environment must allow deployments from tags (`v*`), not only from `main`.
