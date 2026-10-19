# Architecture Decision Records

This folder keeps the important technical decisions of Calculetra as **Architecture Decision Records (ADRs)**.

An ADR is a short document that records one decision: the problem, what was chosen, which alternatives were considered and what follows from it. The code shows *what* was built; ADRs explain *why*, so the reasoning is not lost when someone (or future me) wonders why things are the way they are.

## When to write one

Write an ADR when a decision:

- is hard or expensive to undo (a backend provider, a framework, a data model), or
- affects several parts of the code or how people work on it, or
- had real alternatives that someone could reasonably propose again.

Small, local choices (a variable name, a CSS detail) do not need one.

## Naming and status

- Files are numbered in order and named in kebab-case: `NNNN-short-title.md`, for example `0001-backend-supabase.md`.
- Numbers are never reused.
- Each ADR has a status:
  - **Proposed**: under discussion.
  - **Accepted**: in force.
  - **Superseded by NNNN**: replaced by a newer ADR. The old one is kept, not deleted or rewritten.

To change a decision, write a new ADR and mark the old one as superseded.

## Template

Copy this into a new file:

```md
# N. Title of the decision

- Status: Proposed
- Date: YYYY-MM-DD

## Context

What problem or need forces a decision, and which constraints matter.

## Decision

What we decided, stated clearly, with the key details.

## Alternatives considered

- **Option**: why it was not chosen.

## Consequences

What becomes easier or harder, risks, and follow-up work.
```

## Decisions

| #    | Decision                                             | Status   |
| ---- | ---------------------------------------------------- | -------- |
| 0001 | [Use Supabase as the backend](0001-backend-supabase.md) | Accepted |
| 0002 | [Version the app and release every merge to main](0002-versioning-and-releases.md) | Accepted|
