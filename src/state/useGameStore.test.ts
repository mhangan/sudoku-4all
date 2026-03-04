import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './useGameStore'
import type { GeneratedPuzzle } from '../domain/sudoku/engine'
import { CURRENT_GAME_KEY, BEST_GAMES_KEY } from '../persistence/storage'

const solved = [
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

function makeGenerated(): GeneratedPuzzle {
  const puzzle = [...solved]
  puzzle[0] = 0
  puzzle[1] = 0
  return {
    puzzle,
    solution: [...solved],
    difficulty: 'easy',
  }
}

function resetStores(): void {
  useGameStore.setState(useGameStore.getInitialState(), true)
  localStorage.removeItem(CURRENT_GAME_KEY)
  localStorage.removeItem(BEST_GAMES_KEY)
}

describe('useGameStore', () => {
  beforeEach(() => {
    resetStores()
  })

  it('clears same value in number-first mode', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.getState().setInputMode('number-first')
    useGameStore.getState().setSelectedCell(0)

    useGameStore.getState().applyDigit(5, 0)
    expect(useGameStore.getState().session?.answers[0]).toBe(5)

    useGameStore.getState().applyDigit(5, 0)
    expect(useGameStore.getState().session?.answers[0]).toBe(0)
  })

  it('locks hinted cells from further edits', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.getState().setSelectedCell(0)

    useGameStore.getState().applyHint()

    const afterHint = useGameStore.getState().session
    expect(afterHint?.hintLocked[0]).toBe(true)
    expect(afterHint?.answers[0]).toBe(solved[0])

    useGameStore.getState().eraseCell(0)
    useGameStore.getState().applyDigit(9, 0)

    const afterEditAttempt = useGameStore.getState().session
    expect(afterEditAttempt?.answers[0]).toBe(solved[0])
  })

  it('keeps validation errors until corrected', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.getState().setSelectedCell(0)

    useGameStore.getState().applyDigit(9, 0)
    useGameStore.getState().runValidation()
    expect(useGameStore.getState().validationErrors[0]).toBe(true)

    useGameStore.getState().applyDigit(solved[0], 0)
    expect(useGameStore.getState().validationErrors[0]).toBe(false)
  })

  it('starts timer only after first board change', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())

    useGameStore.getState().tickTimer()
    expect(useGameStore.getState().session?.elapsedSeconds).toBe(0)

    useGameStore.getState().setSelectedCell(0)
    useGameStore.getState().applyDigit(1, 0)
    useGameStore.getState().tickTimer()

    expect(useGameStore.getState().session?.elapsedSeconds).toBe(1)
  })

  it('does not change answers or annotations when switching input mode', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())

    useGameStore.getState().setSelectedCell(0)
    useGameStore.getState().applyDigit(9, 0)

    useGameStore.getState().setAnnotationMode(true)
    useGameStore.getState().setSelectedCell(1)
    useGameStore.getState().applyDigit(2, 1)

    const beforeSwitch = useGameStore.getState().session
    expect(beforeSwitch?.answers[0]).toBe(9)
    expect(beforeSwitch?.annotations[1]).toEqual([2])

    useGameStore.getState().setInputMode('number-first')
    useGameStore.getState().setInputMode('cell-first')

    const afterSwitch = useGameStore.getState().session
    expect(afterSwitch?.answers[0]).toBe(9)
    expect(afterSwitch?.annotations[1]).toEqual([2])
  })

  it('erase clears all annotations in selected cell', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.getState().setAnnotationMode(true)
    useGameStore.getState().setSelectedCell(0)

    useGameStore.getState().applyDigit(1, 0)
    useGameStore.getState().applyDigit(2, 0)
    expect(useGameStore.getState().session?.annotations[0]).toEqual([1, 2])

    useGameStore.getState().eraseCell(0)
    expect(useGameStore.getState().session?.annotations[0]).toEqual([])
  })

  it('removes peer candidate when a correct answer is placed', () => {
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.getState().setAnnotationMode(true)

    useGameStore.getState().setSelectedCell(1)
    useGameStore.getState().applyDigit(1, 1)
    expect(useGameStore.getState().session?.annotations[1]).toEqual([1])

    useGameStore.getState().setAnnotationMode(false)
    useGameStore.getState().setSelectedCell(0)
    useGameStore.getState().applyDigit(1, 0)

    expect(useGameStore.getState().session?.annotations[1]).toEqual([])
  })
})
