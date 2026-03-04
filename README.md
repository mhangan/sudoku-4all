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
