import { create } from 'zustand'
import { generatePuzzle, isSolved, validateAnswers } from '../domain/sudoku/engine'
import type { Difficulty, InProgressGame, InputMode } from '../domain/sudoku/types'

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
  loadSession: (session: InProgressGame) => void
  clearSession: () => void
  applyDigit: (digit: number, targetCell?: number) => void
  eraseCell: (targetCell?: number) => void
  runValidation: () => void
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
      if (session.puzzle[cellIndex] !== 0) return state

      const nextAnswers = [...session.answers]
      const nextAnnotations = session.annotations.map((values) => [...values])

      if (state.annotationMode) {
        const existing = new Set(nextAnnotations[cellIndex])
        if (existing.has(digit)) {
          existing.delete(digit)
        } else {
          existing.add(digit)
        }
        nextAnnotations[cellIndex] = Array.from(existing).sort((left, right) => left - right)
      } else {
        nextAnswers[cellIndex] = digit
        nextAnnotations[cellIndex] = []
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
        validationErrors: Array<boolean>(81).fill(false),
        heldDigit: state.inputMode === 'number-first' ? state.heldDigit : null,
      }
    }),
  eraseCell: (targetCell) =>
    set((state) => {
      const session = state.session
      if (!session) return state

      const cellIndex = targetCell ?? state.selectedCell
      if (cellIndex === null) return state
      if (session.puzzle[cellIndex] !== 0) return state

      const nextAnswers = [...session.answers]
      const nextAnnotations = session.annotations.map((values) => [...values])
      nextAnswers[cellIndex] = 0
      nextAnnotations[cellIndex] = []

      const updatedSession: InProgressGame = {
        ...session,
        answers: nextAnswers,
        annotations: nextAnnotations,
      }

      return {
        session: updatedSession,
        isCompleted: false,
        validationErrors: Array<boolean>(81).fill(false),
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
  applyHint: () =>
    set((state) => {
      const session = state.session
      const cellIndex = state.selectedCell
      if (!session || cellIndex === null) return state
      if (session.puzzle[cellIndex] !== 0) return state

      const nextAnswers = [...session.answers]
      const nextAnnotations = session.annotations.map((values) => [...values])
      nextAnswers[cellIndex] = session.solution[cellIndex]
      nextAnnotations[cellIndex] = []

      const updatedSession: InProgressGame = {
        ...session,
        answers: nextAnswers,
        annotations: nextAnnotations,
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
      return {
        session: {
          ...state.session,
          elapsedSeconds: state.session.elapsedSeconds + 1,
        },
      }
    }),
}))
