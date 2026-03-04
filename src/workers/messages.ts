import type { GeneratedPuzzle } from '../domain/sudoku/engine'
import type { Difficulty, SudokuGrid } from '../domain/sudoku/types'

export type WorkerRequest =
  | { type: 'generate'; difficulty: Difficulty }
  | { type: 'validate'; answers: SudokuGrid; solution: SudokuGrid }

export type WorkerResponse =
  | { type: 'generate:done'; payload: GeneratedPuzzle }
  | { type: 'validate:done'; payload: boolean[] }
