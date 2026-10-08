# Calculetra

A daily numbers-and-letters puzzle inspired by the Spanish TV show *Cifras y Letras*. Every day there is a new challenge, the same for everyone.

**Play it:** https://calculetra.vercel.app

> Work in progress. 

## How to play

### Cifras

You get six numbers and a target. Combine the numbers with `+`, `−`, `×` and `÷` to reach the target, or get as close as you can. Each number can be used at most once.

### Letras

Coming soon.

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for development and builds
- [Vitest](https://vitest.dev) for tests
- [GitHub Actions](https://github.com/features/actions) for CI
- [Vercel](https://vercel.com) for hosting

## Getting started
 
### Prerequisites
 
- [Node.js](https://nodejs.org) 22 or later (it comes with npm). Check your version with `node -v`.
- [Git](https://git-scm.com).
### 1. Clone the repository
 
```bash
git clone https://github.com/MatiCoding/calculetra.git
cd calculetra
```
 
### 2. Install the dependencies
 
```bash
npm ci
```
 
This installs the exact versions listed in `package-lock.json` into a `node_modules` folder. That folder is not committed, so you need to run this after every fresh clone. If you get an error like `'eslint' is not recognized` or `vite: command not found`, you probably skipped this step.
 
### 3. Run the app locally
 
```bash
npm run dev
```
 
### 4. Run the tests
 
```bash
npm test
```
 
This runs every `*.test.ts` file once and shows which tests passed or failed. While you are coding, `npm run test:watch` keeps running and re-runs the tests every time you save.
 
### 5. Check your changes before pushing
 
CI runs these same checks on every push, so running them locally first saves you a red build:
 
```bash
npm run lint   # looks for common mistakes and bad practices
npm test       # runs the tests
npm run build  # checks the types and builds the production version into dist/
```
 
### Available scripts
 
| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Starts the development server with live reload  |
| `npm test`           | Runs the tests once                             |
| `npm run test:watch` | Runs the tests and re-runs them on every change |
| `npm run lint`       | Runs ESLint                                     |
| `npm run build`      | Type-checks and builds for production           |
| `npm run preview`    | Serves the production build locally             |
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
- Work is tracked with GitHub issues, labels (`cifras`, `letras`, `core`, `infra`, `bug`, `enhancement`, `documentation`), milestones and the project board.

## License

See [LICENSE](LICENSE).
