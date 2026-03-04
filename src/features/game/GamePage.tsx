import { useEffect, useMemo, useRef, useState } from 'react'
import { type Difficulty, type InProgressGame } from '../../domain/sudoku/types'
import { clearCurrentGame, loadCurrentGame, saveCurrentGame } from '../../persistence/storage'
import { useBestGamesStore } from '../../state/useBestGamesStore'
import { useGameStore } from '../../state/useGameStore'
import { DigitPad } from '../../ui/DigitPad'

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getRow(index: number): number {
  return Math.floor(index / 9)
}

function getCol(index: number): number {
  return index % 9
}

function isPeerCell(selectedIndex: number, candidateIndex: number): boolean {
  if (selectedIndex === candidateIndex) return false

  const selectedRow = getRow(selectedIndex)
  const selectedCol = getCol(selectedIndex)
  const selectedBoxRow = Math.floor(selectedRow / 3)
  const selectedBoxCol = Math.floor(selectedCol / 3)

  const row = getRow(candidateIndex)
  const col = getCol(candidateIndex)
  const boxRow = Math.floor(row / 3)
  const boxCol = Math.floor(col / 3)

  return row === selectedRow || col === selectedCol || (boxRow === selectedBoxRow && boxCol === selectedBoxCol)
}

export function GamePage() {
  const [pendingResumeGame, setPendingResumeGame] = useState<InProgressGame | null>(null)
  const hasRecordedCompletion = useRef(false)

  const session = useGameStore((state) => state.session)
  const selectedCell = useGameStore((state) => state.selectedCell)
  const heldDigit = useGameStore((state) => state.heldDigit)
  const validationErrors = useGameStore((state) => state.validationErrors)
  const isCompleted = useGameStore((state) => state.isCompleted)
  const difficulty = useGameStore((state) => state.difficulty)
  const inputMode = useGameStore((state) => state.inputMode)
  const annotationMode = useGameStore((state) => state.annotationMode)
  const setInputMode = useGameStore((state) => state.setInputMode)
  const setAnnotationMode = useGameStore((state) => state.setAnnotationMode)
  const setSelectedCell = useGameStore((state) => state.setSelectedCell)
  const setHeldDigit = useGameStore((state) => state.setHeldDigit)
  const startNewGame = useGameStore((state) => state.startNewGame)
  const loadSession = useGameStore((state) => state.loadSession)
  const clearSession = useGameStore((state) => state.clearSession)
  const applyDigit = useGameStore((state) => state.applyDigit)
  const eraseCell = useGameStore((state) => state.eraseCell)
  const runValidation = useGameStore((state) => state.runValidation)
  const applyHint = useGameStore((state) => state.applyHint)
  const tickTimer = useGameStore((state) => state.tickTimer)

  const addBestGame = useBestGamesStore((state) => state.addRecord)

  useEffect(() => {
    const savedGame = loadCurrentGame()
    if (savedGame) {
      setPendingResumeGame(savedGame)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    if (isCompleted) {
      clearCurrentGame()
      return
    }
    saveCurrentGame(session)
  }, [session, isCompleted])

  useEffect(() => {
    if (!session || isCompleted) return

    const intervalId = window.setInterval(() => {
      if (document.hidden) return
      tickTimer()
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [session, isCompleted, tickTimer])

  useEffect(() => {
    if (!session || !isCompleted) {
      hasRecordedCompletion.current = false
      return
    }

    if (hasRecordedCompletion.current) return
    addBestGame({
      difficulty: session.difficulty,
      elapsedSeconds: session.elapsedSeconds,
      cheated: session.cheated,
    })
    clearCurrentGame()
    hasRecordedCompletion.current = true
  }, [addBestGame, isCompleted, session])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (!session || isCompleted) return

      if (event.key >= '1' && event.key <= '9') {
        const digit = Number(event.key)
        if (inputMode === 'cell-first') {
          applyDigit(digit)
        } else {
          setHeldDigit(digit)
        }
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        eraseCell()
        return
      }

      if (selectedCell === null) return

      let nextCell = selectedCell
      if (event.key === 'ArrowUp') nextCell = Math.max(0, selectedCell - 9)
      if (event.key === 'ArrowDown') nextCell = Math.min(80, selectedCell + 9)
      if (event.key === 'ArrowLeft') nextCell = Math.max(0, selectedCell - 1)
      if (event.key === 'ArrowRight') nextCell = Math.min(80, selectedCell + 1)

      if (nextCell !== selectedCell) {
        event.preventDefault()
        setSelectedCell(nextCell)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [applyDigit, eraseCell, inputMode, isCompleted, selectedCell, session, setHeldDigit, setSelectedCell])

  const selectedDigit = useMemo(() => {
    if (!session || selectedCell === null) return null
    const value = session.answers[selectedCell]
    return value === 0 ? null : value
  }, [selectedCell, session])

  const beginNewGame = (newDifficulty: Difficulty): void => {
    startNewGame(newDifficulty)
    setPendingResumeGame(null)
  }

  const onCellClick = (cellIndex: number): void => {
    setSelectedCell(cellIndex)
    if (isCompleted || inputMode !== 'number-first' || heldDigit === null) return
    applyDigit(heldDigit, cellIndex)
  }

  const onDigitClick = (digit: number): void => {
    if (!session || isCompleted) return
    if (inputMode === 'cell-first') {
      applyDigit(digit)
      return
    }

    setHeldDigit(heldDigit === digit ? null : digit)
  }

  const onErase = (): void => {
    if (!session || isCompleted) return
    eraseCell()
  }

  const onResumeSavedGame = (): void => {
    if (!pendingResumeGame) return
    loadSession(pendingResumeGame)
    setPendingResumeGame(null)
  }

  const onDiscardSavedGame = (): void => {
    clearCurrentGame()
    setPendingResumeGame(null)
    clearSession()
  }

  return (
    <section className="space-y-4">
      {pendingResumeGame && !session && (
        <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Resume saved game?</h2>
          <p className="mt-2 text-sm text-slate-700">
            A saved game was found for difficulty <strong>{pendingResumeGame.difficulty}</strong>.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onResumeSavedGame}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onDiscardSavedGame}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {!session && (
        <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Choose difficulty</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => beginNewGame(level)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium capitalize hover:bg-slate-100"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {session && (
        <>
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Current Session</h2>
            <p className="mt-2 text-sm text-slate-700">
              Difficulty: <strong>{difficulty}</strong> · Input mode: <strong>{inputMode}</strong> · Annotation mode:{' '}
              <strong>{annotationMode ? 'on' : 'off'}</strong> · Time: <strong>{formatElapsedTime(session.elapsedSeconds)}</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInputMode(inputMode === 'cell-first' ? 'number-first' : 'cell-first')}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              >
                Switch to {inputMode === 'cell-first' ? 'number-first' : 'cell-first'}
              </button>
              <button
                type="button"
                onClick={() => setAnnotationMode(!annotationMode)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  annotationMode ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'
                }`}
              >
                Annotation {annotationMode ? 'on' : 'off'}
              </button>
              <button
                type="button"
                onClick={runValidation}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              >
                Validate
              </button>
              <button
                type="button"
                onClick={applyHint}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              >
                Hint
              </button>
              <button
                type="button"
                onClick={() => beginNewGame(difficulty)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              >
                New game
              </button>
            </div>
            {session.cheated && <p className="mt-2 text-sm font-medium text-amber-700">Cheated session</p>}
            {isCompleted && (
              <p className="mt-2 text-sm font-semibold text-emerald-700">Completed in {formatElapsedTime(session.elapsedSeconds)}</p>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="aspect-square rounded-lg border border-slate-300 bg-white p-2 shadow-sm sm:p-3">
              <div className="grid h-full grid-cols-9 grid-rows-9 overflow-hidden rounded border border-slate-300">
                {session.answers.map((value, index) => {
                  const isGiven = session.puzzle[index] !== 0
                  const isSelected = selectedCell === index
                  const isPeer = selectedCell !== null && isPeerCell(selectedCell, index)
                  const hasError = validationErrors[index]
                  const highlightSameDigit = selectedDigit !== null && value !== 0 && selectedDigit === value

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onCellClick(index)}
                      className={`relative flex items-center justify-center border border-slate-200 text-base sm:text-lg ${
                        (index + 1) % 3 === 0 && (index + 1) % 9 !== 0 ? 'border-r-2 border-r-slate-400' : ''
                      } ${
                        getRow(index) % 3 === 2 && index < 72 ? 'border-b-2 border-b-slate-400' : ''
                      } ${isSelected ? 'bg-sky-200' : isPeer ? 'bg-sky-50' : 'bg-white'} ${
                        highlightSameDigit ? 'font-semibold text-sky-900' : ''
                      } ${isGiven ? 'font-bold text-slate-900' : 'font-medium text-slate-700'} ${
                        hasError ? 'bg-rose-200 text-rose-900' : ''
                      }`}
                    >
                      {value === 0 ? '' : value}
                      {value === 0 && session.annotations[index].length > 0 && (
                        <span className="pointer-events-none absolute inset-1 grid grid-cols-3 text-[10px] text-slate-500 sm:text-xs">
                          {Array.from({ length: 9 }, (_, mark) => {
                            const digit = mark + 1
                            return <span key={digit}>{session.annotations[index].includes(digit) ? digit : ''}</span>
                          })}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <DigitPad heldDigit={heldDigit} onDigitClick={onDigitClick} onErase={onErase} />
          </div>
        </>
      )}
    </section>
  )
}
