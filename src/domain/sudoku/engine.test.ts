import { describe, expect, it } from 'vitest'
import { generatePuzzle, hasUniqueSolution, isSolved, validateAnswers } from './engine'

function countGivens(puzzle: number[]): number {
  return puzzle.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0)
}

function isValidSolvedGrid(grid: number[]): boolean {
  const expected = '123456789'

  for (let row = 0; row < 9; row += 1) {
    const rowValues = grid.slice(row * 9, row * 9 + 9).slice().sort((left, right) => left - right).join('')
    if (rowValues !== expected) return false
  }

  for (let col = 0; col < 9; col += 1) {
    const colValues = Array.from({ length: 9 }, (_, row) => grid[row * 9 + col])
      .sort((left, right) => left - right)
      .join('')
    if (colValues !== expected) return false
  }

  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      const values: number[] = []
      for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
        for (let colOffset = 0; colOffset < 3; colOffset += 1) {
          const row = boxRow * 3 + rowOffset
          const col = boxCol * 3 + colOffset
          values.push(grid[row * 9 + col])
        }
      }
      if (values.sort((left, right) => left - right).join('') !== expected) return false
    }
  }

  return true
}

describe('sudoku engine scaffold', () => {
  it('generates a puzzle and solution with 81 cells', () => {
    const generated = generatePuzzle('easy')

    expect(generated.puzzle).toHaveLength(81)
    expect(generated.solution).toHaveLength(81)
    expect(isValidSolvedGrid(generated.solution)).toBe(true)
  })

  it('generates puzzles with unique solutions', () => {
    const generated = generatePuzzle('medium')
    expect(hasUniqueSolution(generated.puzzle)).toBe(true)
  })

  it('respects clue ranges per difficulty', () => {
    const easy = countGivens(generatePuzzle('easy').puzzle)
    const medium = countGivens(generatePuzzle('medium').puzzle)
    const hard = countGivens(generatePuzzle('hard').puzzle)
    const expert = countGivens(generatePuzzle('expert').puzzle)

    expect(easy).toBeGreaterThanOrEqual(36)
    expect(easy).toBeLessThanOrEqual(42)
    expect(medium).toBeGreaterThanOrEqual(27)
    expect(medium).toBeLessThanOrEqual(35)
    expect(hard).toBeGreaterThanOrEqual(22)
    expect(hard).toBeLessThanOrEqual(26)
    expect(expert).toBeGreaterThanOrEqual(17)
    expect(expert).toBeLessThanOrEqual(21)
  })

  it('keeps givens consistent with solution', () => {
    const generated = generatePuzzle('hard')
    for (let index = 0; index < generated.puzzle.length; index += 1) {
      if (generated.puzzle[index] !== 0) {
        expect(generated.puzzle[index]).toBe(generated.solution[index])
      }
    }
  })

  it('marks incorrect answers', () => {
    const generated = generatePuzzle('easy')
    const answers = [...generated.solution]
    answers[0] = answers[0] === 9 ? 1 : answers[0] + 1

    const errors = validateAnswers(answers, generated.solution)

    expect(errors.some(Boolean)).toBe(true)
  })

  it('detects solved boards', () => {
    const generated = generatePuzzle('easy')
    expect(isSolved(generated.solution, generated.solution)).toBe(true)
  })
})
