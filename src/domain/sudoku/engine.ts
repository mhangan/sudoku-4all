import type { Difficulty, SudokuGrid } from './types'

export interface GeneratedPuzzle {
  puzzle: SudokuGrid
  solution: SudokuGrid
  difficulty: Difficulty
}

const GRID_SIZE = 9
const CELL_COUNT = 81
const BOX_SIZE = 3
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

interface GivenRange {
  min: number
  max: number
}

function getGivenRange(difficulty: Difficulty): GivenRange {
  switch (difficulty) {
    case 'easy':
      return { min: 36, max: 42 }
    case 'medium':
      return { min: 27, max: 35 }
    case 'hard':
      return { min: 22, max: 26 }
    case 'expert':
      return { min: 17, max: 21 }
  }
}

function randomInt(min: number, max: number): number {
  const normalizedMin = Math.ceil(min)
  const normalizedMax = Math.floor(max)
  return Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) + normalizedMin
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(0, index)
    const current = result[index]
    result[index] = result[target]
    result[target] = current
  }
  return result
}

function getRow(index: number): number {
  return Math.floor(index / GRID_SIZE)
}

function getCol(index: number): number {
  return index % GRID_SIZE
}

function getBoxStart(value: number): number {
  return Math.floor(value / BOX_SIZE) * BOX_SIZE
}

function isPlacementValid(grid: SudokuGrid, index: number, digit: number): boolean {
  const row = getRow(index)
  const col = getCol(index)

  for (let cursor = 0; cursor < GRID_SIZE; cursor += 1) {
    if (grid[row * GRID_SIZE + cursor] === digit) return false
    if (grid[cursor * GRID_SIZE + col] === digit) return false
  }

  const boxRowStart = getBoxStart(row)
  const boxColStart = getBoxStart(col)

  for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
    for (let colOffset = 0; colOffset < BOX_SIZE; colOffset += 1) {
      const checkIndex = (boxRowStart + rowOffset) * GRID_SIZE + (boxColStart + colOffset)
      if (grid[checkIndex] === digit) return false
    }
  }

  return true
}

function getCandidates(grid: SudokuGrid, index: number): number[] {
  if (grid[index] !== 0) return []
  return DIGITS.filter((digit) => isPlacementValid(grid, index, digit))
}

function findBestEmptyCell(grid: SudokuGrid): { index: number; candidates: number[] } | null {
  let bestIndex = -1
  let bestCandidates: number[] = []

  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (grid[index] !== 0) continue
    const candidates = getCandidates(grid, index)
    if (candidates.length === 0) return { index, candidates }
    if (bestIndex === -1 || candidates.length < bestCandidates.length) {
      bestIndex = index
      bestCandidates = candidates
      if (bestCandidates.length === 1) break
    }
  }

  if (bestIndex === -1) return null
  return { index: bestIndex, candidates: bestCandidates }
}

function fillGrid(grid: SudokuGrid): boolean {
  const target = findBestEmptyCell(grid)
  if (!target) return true
  if (target.candidates.length === 0) return false

  const order = shuffle(target.candidates)
  for (const digit of order) {
    grid[target.index] = digit
    if (fillGrid(grid)) return true
    grid[target.index] = 0
  }

  return false
}

function createSolvedBoard(): SudokuGrid {
  const grid = Array<number>(CELL_COUNT).fill(0)
  const solved = fillGrid(grid)
  if (!solved) {
    throw new Error('Unable to generate solved Sudoku board')
  }
  return grid
}

function countSolutions(grid: SudokuGrid, maxSolutions: number): number {
  const target = findBestEmptyCell(grid)
  if (!target) return 1
  if (target.candidates.length === 0) return 0

  let count = 0
  for (const digit of target.candidates) {
    grid[target.index] = digit
    count += countSolutions(grid, maxSolutions)
    grid[target.index] = 0

    if (count >= maxSolutions) return count
  }

  return count
}

export function hasUniqueSolution(grid: SudokuGrid): boolean {
  const copy = [...grid]
  return countSolutions(copy, 2) === 1
}

function countGivenCells(grid: SudokuGrid): number {
  return grid.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0)
}

function getAttemptBudget(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 10
    case 'medium':
      return 30
    case 'hard':
      return 120
    case 'expert':
      return 500
  }
}

export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const range = getGivenRange(difficulty)
  const attemptBudget = getAttemptBudget(difficulty)
  let bestPuzzle: SudokuGrid | null = null
  let bestSolution: SudokuGrid | null = null
  let bestGivenCount = CELL_COUNT

  for (let attempt = 0; attempt < attemptBudget; attempt += 1) {
    const solution = createSolvedBoard()
    const puzzle = [...solution]
    const targetGivenCells = range.max
    const indexes = shuffle(Array.from({ length: CELL_COUNT }, (_, index) => index))

    for (const index of indexes) {
      if (countGivenCells(puzzle) <= targetGivenCells) break

      const backup = puzzle[index]
      puzzle[index] = 0

      if (!hasUniqueSolution(puzzle)) {
        puzzle[index] = backup
      }
    }

    const givenCount = countGivenCells(puzzle)
    if (givenCount >= range.min && givenCount <= range.max) {
      return { puzzle, solution, difficulty }
    }

    if (givenCount < bestGivenCount) {
      bestGivenCount = givenCount
      bestPuzzle = puzzle
      bestSolution = solution
    }
  }

  if (bestPuzzle && bestSolution) {
    return {
      puzzle: bestPuzzle,
      solution: bestSolution,
      difficulty,
    }
  }

  const solution = createSolvedBoard()
  const puzzle = [...solution]

  return {
    puzzle,
    solution,
    difficulty,
  }
}

export function validateAnswers(answers: SudokuGrid, solution: SudokuGrid): boolean[] {
  return answers.map((value, index) => value !== 0 && value !== solution[index])
}

export function isSolved(answers: SudokuGrid, solution: SudokuGrid): boolean {
  return answers.every((value, index) => value === solution[index])
}
