import type { Difficulty, SudokuGrid } from './types'

export interface GeneratedPuzzle {
  puzzle: SudokuGrid
  solution: SudokuGrid
  difficulty: Difficulty
}

const baseSolution: SudokuGrid = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  4, 5, 6, 7, 8, 9, 1, 2, 3,
  7, 8, 9, 1, 2, 3, 4, 5, 6,
  2, 3, 4, 5, 6, 7, 8, 9, 1,
  5, 6, 7, 8, 9, 1, 2, 3, 4,
  8, 9, 1, 2, 3, 4, 5, 6, 7,
  3, 4, 5, 6, 7, 8, 9, 1, 2,
  6, 7, 8, 9, 1, 2, 3, 4, 5,
  9, 1, 2, 3, 4, 5, 6, 7, 8,
]

function getGivenRange(difficulty: Difficulty): { min: number; max: number } {
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

function permuteSolution(solution: SudokuGrid): SudokuGrid {
  const digitPermutation = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  return solution.map((value) => digitPermutation[value - 1])
}

export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const solution = permuteSolution(baseSolution)
  const puzzle = [...solution]
  const { min, max } = getGivenRange(difficulty)
  const givenCells = randomInt(min, max)
  const indexes = shuffle(Array.from({ length: 81 }, (_, index) => index))

  for (let index = givenCells; index < indexes.length; index += 1) {
    puzzle[indexes[index]] = 0
  }

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
