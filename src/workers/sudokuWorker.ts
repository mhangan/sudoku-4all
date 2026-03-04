import { generatePuzzle, validateAnswers } from '../domain/sudoku/engine'
import type { Difficulty, SudokuGrid } from '../domain/sudoku/types'

type WorkerRequest =
  | { type: 'generate'; difficulty: Difficulty }
  | { type: 'validate'; answers: SudokuGrid; solution: SudokuGrid }

type WorkerResponse =
  | { type: 'generate:done'; payload: ReturnType<typeof generatePuzzle> }
  | { type: 'validate:done'; payload: boolean[] }

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data

  if (message.type === 'generate') {
    const puzzle = generatePuzzle(message.difficulty)
    const response: WorkerResponse = { type: 'generate:done', payload: puzzle }
    self.postMessage(response)
    return
  }

  const errors = validateAnswers(message.answers, message.solution)
  const response: WorkerResponse = { type: 'validate:done', payload: errors }
  self.postMessage(response)
}
