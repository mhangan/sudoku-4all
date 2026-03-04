import { create } from 'zustand'
import { generatePuzzle, isSolved, validateAnswers } from '../domain/sudoku/engine'
import type { GeneratedPuzzle } from '../domain/sudoku/engine'
import type { Difficulty, InProgressGame, InputMode } from '../domain/sudoku/types'

function getPeerIndexes(index: number): number[] {
  const row = Math.floor(index / 9)
  const col = index % 9
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  const indexes = new Set<number>()

  for (let cursor = 0; cursor < 9; cursor += 1) {
    indexes.add(row * 9 + cursor)
    indexes.add(cursor * 9 + col)
  }

  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let colOffset = 0; colOffset < 3; colOffset += 1) {
      indexes.add((boxRow + rowOffset) * 9 + (boxCol + colOffset))
    }
  }

  indexes.delete(index)
  return Array.from(indexes)
}

function hasAnyCellChange(session: InProgressGame): boolean {
  for (let index = 0; index < 81; index += 1) {
    if (session.answers[index] !== session.puzzle[index]) return true
    if (session.annotations[index].length > 0) return true
    if (session.hintLocked[index]) return true
  }
  return false
}

interface GameState {
  difficulty: Difficulty
  inputMode: InputMode
  annotationMode: boolean
  selectedCell: number | null
  heldDigit: number | null
  validationErrors: boolean[]
  session: InProgressGame | null
  isCompleted: boolean
  setDifficulty: (difficulty: Difficulty) => void
  setInputMode: (mode: InputMode) => void
  setAnnotationMode: (enabled: boolean) => void
  setSelectedCell: (cellIndex: number | null) => void
  setHeldDigit: (digit: number | null) => void
  startNewGame: (difficulty?: Difficulty) => void
  startNewGameFromGenerated: (generated: GeneratedPuzzle) => void
  loadSession: (session: InProgressGame) => void
  clearSession: () => void
  applyDigit: (digit: number, targetCell?: number) => void
  eraseCell: (targetCell?: number) => void
  runValidation: () => void
  applyValidationResult: (errors: boolean[]) => void
  applyHint: () => void
  tickTimer: () => void
}

export const useGameStore = create<GameState>((set) => ({
  difficulty: 'easy',
  inputMode: 'cell-first',
  annotationMode: false,
  selectedCell: null,
  heldDigit: null,
  validationErrors: Array<boolean>(81).fill(false),
  session: null,
  isCompleted: false,
  setDifficulty: (difficulty) => set({ difficulty }),
  setInputMode: (inputMode) =>
    set((state) => ({
      inputMode,
      heldDigit: inputMode === 'cell-first' ? null : state.heldDigit,
      session: state.session
        ? {
            ...state.session,
            inputMode,
          }
        : null,
    })),
  setAnnotationMode: (annotationMode) =>
    set((state) => ({
      annotationMode,
      session: state.session
        ? {
            ...state.session,
            annotationMode,
          }
        : null,
    })),
  setSelectedCell: (selectedCell) => set({ selectedCell }),
  setHeldDigit: (heldDigit) => set({ heldDigit }),
  startNewGame: (incomingDifficulty) =>
    set((state) => {
      const difficulty = incomingDifficulty ?? state.difficulty
      const generated = generatePuzzle(difficulty)
      const session: InProgressGame = {
        version: '1.0.0',
        puzzle: generated.puzzle,
        solution: generated.solution,
        answers: [...generated.puzzle],
        annotations: Array.from({ length: 81 }, () => []),
        hintLocked: Array.from({ length: 81 }, () => false),
        difficulty,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        inputMode: 'cell-first',
        annotationMode: false,
        cheated: false,
      }

      return {
        difficulty,
        inputMode: 'cell-first',
        annotationMode: false,
        selectedCell: null,
        heldDigit: null,
        validationErrors: Array<boolean>(81).fill(false),
        session,
        isCompleted: false,
      }
    }),
  startNewGameFromGenerated: (generated) =>
    set(() => {
      const session: InProgressGame = {
        version: '1.0.0',
        puzzle: generated.puzzle,
        solution: generated.solution,
        answers: [...generated.puzzle],
        annotations: Array.from({ length: 81 }, () => []),
        hintLocked: Array.from({ length: 81 }, () => false),
        difficulty: generated.difficulty,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        inputMode: 'cell-first',
        annotationMode: false,
        cheated: false,
      }

      return {
        difficulty: generated.difficulty,
        inputMode: 'cell-first',
        annotationMode: false,
        selectedCell: null,
        heldDigit: null,
        validationErrors: Array<boolean>(81).fill(false),
        session,
        isCompleted: false,
      }
    }),
  loadSession: (session) =>
    set({
      difficulty: session.difficulty,
      inputMode: session.inputMode,
      annotationMode: session.annotationMode,
      selectedCell: null,
      heldDigit: null,
      validationErrors: Array<boolean>(81).fill(false),
      session,
      isCompleted: isSolved(session.answers, session.solution),
    }),
  clearSession: () =>
    set({
      selectedCell: null,
      heldDigit: null,
      validationErrors: Array<boolean>(81).fill(false),
      session: null,
      isCompleted: false,
    }),
  applyDigit: (digit, targetCell) =>
    set((state) => {
      const session = state.session
      if (!session) return state

      const cellIndex = targetCell ?? state.selectedCell
      if (cellIndex === null) return state
      if (session.puzzle[cellIndex] !== 0 || session.hintLocked[cellIndex]) return state

      const nextAnswers = [...session.answers]
      const nextAnnotations = session.annotations.map((values) => [...values])
      const nextErrors = [...state.validationErrors]

      if (state.annotationMode) {
        const existing = new Set(nextAnnotations[cellIndex])
        if (existing.has(digit)) {
          existing.delete(digit)
        } else {
          existing.add(digit)
        }
        nextAnnotations[cellIndex] = Array.from(existing).sort((left, right) => left - right)
      } else {
        if (state.inputMode === 'number-first' && nextAnswers[cellIndex] === digit) {
          nextAnswers[cellIndex] = 0
        } else {
          nextAnswers[cellIndex] = digit
        }
        nextAnnotations[cellIndex] = []

        if (nextAnswers[cellIndex] === session.solution[cellIndex] && nextAnswers[cellIndex] !== 0) {
          const peers = getPeerIndexes(cellIndex)
          for (const peerIndex of peers) {
            nextAnnotations[peerIndex] = nextAnnotations[peerIndex].filter((value) => value !== digit)
          }
        }
      }

      if (nextAnswers[cellIndex] === session.solution[cellIndex]) {
        nextErrors[cellIndex] = false
      }

      const updatedSession: InProgressGame = {
        ...session,
        answers: nextAnswers,
        annotations: nextAnnotations,
        inputMode: state.inputMode,
        annotationMode: state.annotationMode,
      }

      return {
        session: updatedSession,
        isCompleted: isSolved(updatedSession.answers, updatedSession.solution),
        validationErrors: nextErrors,
        heldDigit: state.inputMode === 'number-first' ? state.heldDigit : null,
      }
    }),
  eraseCell: (targetCell) =>
    set((state) => {
      const session = state.session
      if (!session) return state

      const cellIndex = targetCell ?? state.selectedCell
      if (cellIndex === null) return state
      if (session.puzzle[cellIndex] !== 0 || session.hintLocked[cellIndex]) return state

      const nextAnswers = [...session.answers]
      const nextAnnotations = session.annotations.map((values) => [...values])
      const nextErrors = [...state.validationErrors]
      nextAnswers[cellIndex] = 0
      nextAnnotations[cellIndex] = []
      nextErrors[cellIndex] = false

      const updatedSession: InProgressGame = {
        ...session,
        answers: nextAnswers,
        annotations: nextAnnotations,
      }

      return {
        session: updatedSession,
        isCompleted: false,
        validationErrors: nextErrors,
      }
    }),
  runValidation: () =>
    set((state) => {
      if (!state.session) return state
      return {
        session: {
          ...state.session,
          cheated: true,
        },
        validationErrors: validateAnswers(state.session.answers, state.session.solution),
      }
    }),
  applyValidationResult: (errors) =>
    set((state) => {
      if (!state.session) return state
      return {
        session: {
          ...state.session,
          cheated: true,
        },
        validationErrors: errors,
      }
    }),
  applyHint: () =>
    set((state) => {
      const session = state.session
      const cellIndex = state.selectedCell
      if (!session || cellIndex === null) return state
      if (session.puzzle[cellIndex] !== 0 || session.hintLocked[cellIndex]) return state
      if (session.answers[cellIndex] === session.solution[cellIndex]) return state

      const nextAnswers = [...session.answers]
      const nextAnnotations = session.annotations.map((values) => [...values])
      const nextHintLocked = [...session.hintLocked]
      nextAnswers[cellIndex] = session.solution[cellIndex]
      nextAnnotations[cellIndex] = []
      nextHintLocked[cellIndex] = true

      const updatedSession: InProgressGame = {
        ...session,
        answers: nextAnswers,
        annotations: nextAnnotations,
        hintLocked: nextHintLocked,
        cheated: true,
      }

      return {
        session: updatedSession,
        isCompleted: isSolved(updatedSession.answers, updatedSession.solution),
        validationErrors: Array<boolean>(81).fill(false),
      }
    }),
  tickTimer: () =>
    set((state) => {
      if (!state.session || state.isCompleted) return state
      if (!hasAnyCellChange(state.session)) return state
      return {
        session: {
          ...state.session,
          elapsedSeconds: state.session.elapsedSeconds + 1,
        },
      }
    }),
}))
