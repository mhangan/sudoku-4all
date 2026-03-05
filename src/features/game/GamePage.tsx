import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Difficulty, type InProgressGame } from '../../domain/sudoku/types'
import { clearCurrentGame, loadCurrentGame, saveCurrentGame } from '../../persistence/storage'
import { useBestGamesStore } from '../../state/useBestGamesStore'
import { useGameStore } from '../../state/useGameStore'
import { DigitPad } from '../../ui/DigitPad'
import { generatePuzzleInWorker, validateAnswersInWorker } from '../../workers/sudokuWorkerClient'

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
  const navigate = useNavigate()
  const [pendingResumeGame, setPendingResumeGame] = useState<InProgressGame | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
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
  const startNewGameFromGenerated = useGameStore((state) => state.startNewGameFromGenerated)
  const loadSession = useGameStore((state) => state.loadSession)
  const clearSession = useGameStore((state) => state.clearSession)
  const applyDigit = useGameStore((state) => state.applyDigit)
  const eraseCell = useGameStore((state) => state.eraseCell)
  const applyValidationResult = useGameStore((state) => state.applyValidationResult)
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

  const digitCounts = useMemo(() => {
    const counts = Array<number>(10).fill(0)
    if (!session) return counts

    for (const value of session.answers) {
      if (value >= 1 && value <= 9) {
        counts[value] += 1
      }
    }

    return counts
  }, [session])

  const beginNewGame = async (newDifficulty: Difficulty): Promise<void> => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const generated = await generatePuzzleInWorker(newDifficulty)
      startNewGameFromGenerated(generated)
      setPendingResumeGame(null)
    } catch {
      startNewGame(newDifficulty)
      setPendingResumeGame(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const onValidate = async (): Promise<void> => {
    if (!session || isValidating) return

    if (!session.cheated) {
      const confirmed = window.confirm('Validation marks this game as cheated. Continue?')
      if (!confirmed) return
    }

    setIsValidating(true)
    try {
      const errors = await validateAnswersInWorker(session.answers, session.solution)
      applyValidationResult(errors)
    } catch {
      applyValidationResult([])
    } finally {
      setIsValidating(false)
    }
  }

  const onHint = (): void => {
    if (!session || isCompleted) return

    if (selectedCell === null) {
      window.alert('Please select a cell first.')
      return
    }

    if (session.answers[selectedCell] === session.solution[selectedCell]) {
      window.alert('This cell is already correctly filled.')
      return
    }

    if (!session.cheated) {
      const confirmed = window.confirm('Using a hint marks this game as cheated. Continue?')
      if (!confirmed) return
    }

    applyHint()
  }

  const onCellClick = (cellIndex: number): void => {
    if (isCompleted) return
    setSelectedCell(cellIndex)
    if (inputMode !== 'number-first' || heldDigit === null) return
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

  const onViewBestGames = (): void => {
    navigate('/best-games')
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

      {!session && !pendingResumeGame && (
        <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Choose difficulty</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  void beginNewGame(level)
                }}
                disabled={isGenerating}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium capitalize hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {level}
              </button>
            ))}
          </div>
          {isGenerating && <p className="mt-3 text-sm text-slate-600">Generating puzzle…</p>}
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
                disabled={isCompleted}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                Switch to {inputMode === 'cell-first' ? 'number-first' : 'cell-first'}
              </button>
              <button
                type="button"
                onClick={() => setAnnotationMode(!annotationMode)}
                disabled={isCompleted}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  annotationMode ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Annotation {annotationMode ? 'on' : 'off'}
              </button>
              <button
                type="button"
                onClick={() => {
                  void onValidate()
                }}
                disabled={isValidating || isCompleted}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isValidating ? 'Validating…' : 'Validate'}
              </button>
              <button
                type="button"
                onClick={onHint}
                disabled={isCompleted}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hint
              </button>
              <button
                type="button"
                onClick={() => {
                  void beginNewGame(difficulty)
                }}
                disabled={isGenerating}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? 'Generating…' : 'New game'}
              </button>
            </div>
            {session.cheated && <p className="mt-2 text-sm font-medium text-amber-700">Cheated session</p>}
          </div>

          {isCompleted && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-emerald-800">Congratulations!</h3>
              <p className="mt-2 text-sm text-emerald-900">
                You completed <strong className="capitalize">{session.difficulty}</strong> in{' '}
                <strong>{formatElapsedTime(session.elapsedSeconds)}</strong> and the run is{' '}
                <strong>{session.cheated ? 'cheated' : 'clean'}</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void beginNewGame(difficulty)
                  }}
                  className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Start new game
                </button>
                <button
                  type="button"
                  onClick={onViewBestGames}
                  className="rounded-md border border-emerald-700 bg-white px-3 py-2 text-sm font-medium text-emerald-800"
                >
                  View best games
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="aspect-square rounded-lg border border-slate-300 bg-white p-2 shadow-sm sm:p-3">
              <div className="grid h-full grid-cols-9 grid-rows-9 overflow-hidden rounded border border-slate-300">
                {session.answers.map((value, index) => {
                  const isGiven = session.puzzle[index] !== 0 || session.hintLocked[index]
                  const isSelected = selectedCell === index
                  const isPeer = selectedCell !== null && isPeerCell(selectedCell, index)
                  const hasError = validationErrors[index]
                  const highlightSameDigit =
                    selectedDigit !== null &&
                    index !== selectedCell &&
                    (value === selectedDigit || session.annotations[index].includes(selectedDigit))
                  const backgroundClass = hasError
                    ? 'bg-rose-200 text-rose-900'
                    : isSelected
                      ? 'bg-sky-200'
                      : highlightSameDigit
                        ? 'bg-sky-200'
                      : isPeer
                        ? isGiven
                          ? 'bg-amber-100'
                          : 'bg-amber-50'
                        : isGiven
                          ? 'bg-slate-100'
                          : 'bg-white'

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onCellClick(index)}
                      disabled={isCompleted}
                      className={`relative flex items-center justify-center border border-slate-200 text-lg sm:text-xl ${
                        (index + 1) % 3 === 0 && (index + 1) % 9 !== 0 ? 'border-r-2 border-r-slate-400' : ''
                      } ${
                        getRow(index) % 3 === 2 && index < 72 ? 'border-b-2 border-b-slate-400' : ''
                      } ${backgroundClass} ${
                        highlightSameDigit && value !== 0 ? 'font-semibold text-sky-900' : ''
                      } ${isGiven ? 'font-bold text-slate-900' : 'font-medium text-slate-700'} ${
                        isSelected ? 'z-10 ring-2 ring-inset ring-slate-900' : ''
                      } disabled:cursor-default`}
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
            <DigitPad heldDigit={heldDigit} digitCounts={digitCounts} onDigitClick={onDigitClick} onErase={onErase} />
          </div>
        </>
      )}
    </section>
  )
}
