import type { Difficulty, SudokuGrid } from '../domain/sudoku/types'
import type { GeneratedPuzzle } from '../domain/sudoku/engine'
import type { WorkerRequest, WorkerResponse } from './messages'

function runWorkerRequest(request: WorkerRequest): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./sudokuWorker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      resolve(event.data)
      worker.terminate()
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }

    worker.postMessage(request)
  })
}

export async function generatePuzzleInWorker(difficulty: Difficulty): Promise<GeneratedPuzzle> {
  const response = await runWorkerRequest({ type: 'generate', difficulty })
  if (response.type !== 'generate:done') {
    throw new Error('Unexpected worker response type for puzzle generation')
  }
  return response.payload
}

export async function validateAnswersInWorker(answers: SudokuGrid, solution: SudokuGrid): Promise<boolean[]> {
  const response = await runWorkerRequest({ type: 'validate', answers, solution })
  if (response.type !== 'validate:done') {
    throw new Error('Unexpected worker response type for validation')
  }
  return response.payload
}
