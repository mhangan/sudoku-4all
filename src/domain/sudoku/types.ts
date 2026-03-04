export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type InputMode = 'cell-first' | 'number-first'

export type SudokuGrid = number[]

export interface InProgressGame {
  version: string
  puzzle: SudokuGrid
  solution: SudokuGrid
  answers: SudokuGrid
  annotations: number[][]
  hintLocked: boolean[]
  difficulty: Difficulty
  startedAt: string
  elapsedSeconds: number
  inputMode: InputMode
  annotationMode: boolean
  cheated: boolean
}

export interface CompletedGameRecord {
  id: string
  difficulty: Difficulty
  completedAt: string
  elapsedSeconds: number
  cheated: boolean
}

export interface BestGames {
  version: string
  records: CompletedGameRecord[]
}
