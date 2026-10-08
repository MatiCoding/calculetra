# Calculetra

A daily numbers-and-letters puzzle inspired by the Spanish TV show *Cifras y Letras*. Every day there is a new challenge, the same for everyone.

**Play it:** https://calculetra.vercel.app

> 🚧 Work in progress. The first mode being built is **Cifras** (numbers); **Letras** (letters) will follow.

## How to play

### Cifras

You get six numbers and a target. Combine the numbers with `+`, `−`, `×` and `÷` to reach the target, or get as close as you can. Each number can be used at most once.

### Letras

Coming soon.

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for development and builds
- [Vitest](https://vitest.dev) for tests
- [ESLint](https://eslint.org) for linting
- [GitHub Actions](https://github.com/features/actions) for CI
- [Vercel](https://vercel.com) for hosting

## Getting started

Requires Node.js 22 or later.

```bash
npm ci             # install dependencies
npm run dev        # start the dev server
npm test           # run the tests once
npm run test:watch # run the tests in watch mode
npm run lint       # run ESLint
npm run build      # type-check and build for production
```

## Project structure

```
src/
├── domain/   # game logic (pure TypeScript, no React)
└── ...       # UI components
docs/         # game rules and technical decisions
```

Game logic lives in `src/domain` and is kept separate from the UI, so it can be tested on its own.

## Workflow

- `main` is production. Every change merged into it is deployed automatically to Vercel.
- `developer` is the working branch. Day-to-day commits are pushed there directly.
- Releases go from `developer` to `main` through a pull request, merged with a merge commit.
- `main` is protected: changes need a pull request and a passing CI run.
- CI runs lint, tests and build on every push to `developer` and on every pull request to `main`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`…).
- Work is tracked with GitHub issues, labels (`cifras`, `letras`, `core`, `infra`, `bug`, `enhancement`, `documentation`), milestones and the project board.

## License

See [LICENSE](LICENSE).
