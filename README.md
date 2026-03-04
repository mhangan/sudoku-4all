# sudoku-4all

A free Sudoku game developed with AI.

## Stack

- TypeScript
- React + React Router
- Vite
- Tailwind CSS
- Zustand
- Zod
- Vitest + React Testing Library
- Playwright

## Prerequisites

- Node.js 22 LTS (or newer)
- npm 10+

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start dev server
- `npm run build` - type-check and production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm run test` - run unit/integration tests
- `npm run test:e2e` - run Playwright e2e tests

## Release Checklist

Run these commands before publishing a release:

```bash
npm install
npm run test
npm run build
npm run test:e2e -- --reporter=line
```

Expected results:

- All Vitest suites pass with no failing tests.
- Vite production build completes successfully and outputs `dist/` assets.
- Playwright suites pass with no failed specs.
- No unresolved TypeScript or lint errors remain.

## CI Status

[![CI](https://github.com/mhangan/sudoku-4all/actions/workflows/ci.yml/badge.svg)](https://github.com/mhangan/sudoku-4all/actions/workflows/ci.yml)
[![Lint](https://github.com/mhangan/sudoku-4all/actions/workflows/lint.yml/badge.svg)](https://github.com/mhangan/sudoku-4all/actions/workflows/lint.yml)

Badge status reflects the latest runs on the `main` branch; individual pull request checks may differ.

Recommended CI workflow order:

1. `npm ci`
2. `npm run test`
3. `npm run build`
4. `npm run test:e2e -- --reporter=line`

## Test Coverage

- **Domain / engine tests**
	- Sudoku solution validity (rows, columns, boxes)
	- Unique-solution generation
	- Difficulty clue-range checks
	- Validation and solved-state helpers
- **Store tests**
	- Input mode behavior (Cell-First / Number-First)
	- Hint locking and edit restrictions
	- Validation error persistence/clearing rules
	- Timer start-after-first-change behavior
	- Best-games sorting, capping, persistence, and recent-highlight tracking
- **Page integration tests (React Testing Library)**
	- `GamePage` generation flow, confirm dialogs, completion actions, and navigation
	- `BestGamesPage` rendering, clear-confirmation flow, and newest-record highlight
- **E2E tests (Playwright)**
	- App boot and difficulty entry screen
	- Resume/discard saved session flow
	- Validate/Hint confirmation behavior
	- Best-games clear confirmation (accept/decline)
	- Completion panel actions (`View best games`, `Start new game`)

## Project Structure

- `src/app` - app shell and routing
- `src/features` - feature modules (`game`, `best-games`)
- `src/state` - Zustand stores
- `src/domain` - Sudoku domain logic and types
- `src/persistence` - localStorage repository and schema validation
- `src/workers` - Web Worker entry points
- `src/ui` - reusable UI components
- `spec` - functional and technical specifications

## Contributor Skills & Checklists

- Use `docs/skills/README.md` to choose the right checklist for the type of change.
- Core contributor guidance also lives in `CONTRIBUTING.md` and `.github/copilot-instructions.md`.
