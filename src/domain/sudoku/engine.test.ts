import { describe, expect, it } from 'vitest'
import { generatePuzzle, isSolved, validateAnswers } from './engine'

describe('sudoku engine scaffold', () => {
  it('generates a puzzle and solution with 81 cells', () => {
    const generated = generatePuzzle('easy')

    expect(generated.puzzle).toHaveLength(81)
    expect(generated.solution).toHaveLength(81)
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
