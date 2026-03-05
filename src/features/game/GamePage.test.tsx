import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GamePage } from './GamePage'
import { useGameStore } from '../../state/useGameStore'
import { useBestGamesStore } from '../../state/useBestGamesStore'
import { BEST_GAMES_KEY, CURRENT_GAME_KEY } from '../../persistence/storage'
import type { GeneratedPuzzle } from '../../domain/sudoku/engine'
import type { InProgressGame } from '../../domain/sudoku/types'
import { generatePuzzleInWorker, validateAnswersInWorker } from '../../workers/sudokuWorkerClient'

vi.mock('../../workers/sudokuWorkerClient', () => ({
  generatePuzzleInWorker: vi.fn(),
  validateAnswersInWorker: vi.fn(),
}))

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

function makeGenerated(difficulty: GeneratedPuzzle['difficulty'] = 'easy'): GeneratedPuzzle {
  const puzzle = [...solved]
  puzzle[0] = 0
  return {
    puzzle,
    solution: [...solved],
    difficulty,
  }
}

function makeCompletedSession(): InProgressGame {
  return {
    version: '1.0.0',
    puzzle: [...solved],
    solution: [...solved],
    answers: [...solved],
    annotations: Array.from({ length: 81 }, () => []),
    hintLocked: Array.from({ length: 81 }, () => false),
    difficulty: 'easy',
    startedAt: new Date().toISOString(),
    elapsedSeconds: 125,
    inputMode: 'cell-first',
    annotationMode: false,
    cheated: false,
  }
}

function resetState(): void {
  useGameStore.setState(useGameStore.getInitialState(), true)
  useBestGamesStore.setState(useBestGamesStore.getInitialState(), true)
  localStorage.removeItem(CURRENT_GAME_KEY)
  localStorage.removeItem(BEST_GAMES_KEY)
}

function renderPage(): void {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/best-games" element={<div>Best Games Route</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function getDigitPadButton(digit: number): HTMLButtonElement {
  const digitPad = screen.getByRole('heading', { name: 'Digit Pad' }).closest('aside')
  if (!digitPad) {
    throw new Error('Digit pad container not found')
  }

  const button = within(digitPad)
    .getAllByRole('button')
    .find((candidate) => candidate.textContent?.replace(/\s+/g, '').startsWith(String(digit)))

  if (!button) {
    throw new Error(`Digit button ${digit} not found`)
  }

  return button as HTMLButtonElement
}

describe('GamePage integration', () => {
  beforeEach(() => {
    resetState()
    vi.clearAllMocks()
    vi.mocked(generatePuzzleInWorker).mockResolvedValue(makeGenerated())
    vi.mocked(validateAnswersInWorker).mockResolvedValue(Array<boolean>(81).fill(false))
  })

  it('starts a game from difficulty selection using worker generation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'easy' }))

    await screen.findByText('Current Session')
    expect(generatePuzzleInWorker).toHaveBeenCalledWith('easy')
    expect(screen.getByText(/Difficulty:/)).toBeInTheDocument()
  })

  it('does not validate when confirmation is declined', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Validate' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(validateAnswersInWorker).not.toHaveBeenCalled()
  })

  it('shows informative hint message when no cell is selected', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined)

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Hint' }))

    expect(alertSpy).toHaveBeenCalledWith('Please select a cell first.')
  })

  it('navigates to best games from completion panel', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      session: makeCompletedSession(),
      isCompleted: true,
      difficulty: 'easy',
    })

    renderPage()
    await user.click(screen.getByRole('button', { name: 'View best games' }))

    await waitFor(() => {
      expect(screen.getByText('Best Games Route')).toBeInTheDocument()
    })
  })

  it('resumes a saved game when resume is confirmed', async () => {
    const user = userEvent.setup()
    const generated = makeGenerated()
    const savedSession: InProgressGame = {
      ...makeCompletedSession(),
      answers: generated.puzzle,
      puzzle: generated.puzzle,
      hintLocked: Array.from({ length: 81 }, () => false),
    }
    localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(savedSession))

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Resume' }))
    expect(screen.getByText('Current Session')).toBeInTheDocument()
  })

  it('discards a saved game and returns to difficulty selection', async () => {
    const user = userEvent.setup()
    const generated = makeGenerated()
    const savedSession: InProgressGame = {
      ...makeCompletedSession(),
      answers: generated.puzzle,
      puzzle: generated.puzzle,
      hintLocked: Array.from({ length: 81 }, () => false),
    }
    localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(savedSession))

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Discard' }))
    expect(screen.getByText('Choose difficulty')).toBeInTheDocument()
  })

  it('runs worker validation when confirmation is accepted', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(validateAnswersInWorker).mockResolvedValue([true, ...Array<boolean>(80).fill(false)])

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Validate' }))

    await waitFor(() => {
      expect(validateAnswersInWorker).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByText('Cheated session')).toBeInTheDocument()
  })

  it('skips validate confirmation when session is already cheated', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.setState((state) => ({
      session: state.session
        ? {
            ...state.session,
            cheated: true,
          }
        : null,
    }))

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Validate' }))

    await waitFor(() => {
      expect(validateAnswersInWorker).toHaveBeenCalledTimes(1)
    })
    expect(confirmSpy).not.toHaveBeenCalled()
  })

  it('starts a new game from completion panel action', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      session: makeCompletedSession(),
      isCompleted: true,
      difficulty: 'easy',
    })

    vi.mocked(generatePuzzleInWorker).mockResolvedValue(makeGenerated('medium'))

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Start new game' }))

    await waitFor(() => {
      expect(generatePuzzleInWorker).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument()
    })
  })

  it('shows informative message when hint is requested on a correct cell', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.getState().setSelectedCell(8)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined)

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Hint' }))

    expect(alertSpy).toHaveBeenCalledWith('This cell is already correctly filled.')
  })

  it('skips hint confirmation when session is already cheated', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())
    useGameStore.setState((state) => ({
      session: state.session
        ? {
            ...state.session,
            cheated: true,
          }
        : null,
    }))
    useGameStore.getState().setSelectedCell(0)

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Hint' }))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(useGameStore.getState().session?.answers[0]).toBe(solved[0])
  })

  it('shows digit counters and disables a digit at 9/9 until erased', async () => {
    const user = userEvent.setup()
    const generated = makeGenerated()
    generated.puzzle[1] = 0
    useGameStore.getState().startNewGameFromGenerated(generated)
    useGameStore.getState().setSelectedCell(0)

    renderPage()

    const oneButtonBefore = getDigitPadButton(1)
    expect(within(oneButtonBefore).getByLabelText('Count 1')).toHaveTextContent('8')
    expect(oneButtonBefore.disabled).toBe(false)

    await user.click(oneButtonBefore)

    const oneButtonAfterFill = getDigitPadButton(1)
    expect(within(oneButtonAfterFill).getByLabelText('Count 1')).toHaveTextContent('9')
    expect(oneButtonAfterFill.disabled).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Erase' }))

    const oneButtonAfterErase = getDigitPadButton(1)
    expect(within(oneButtonAfterErase).getByLabelText('Count 1')).toHaveTextContent('8')
    expect(oneButtonAfterErase.disabled).toBe(false)
  })

  it('renders a dark border around the selected cell', async () => {
    const user = userEvent.setup()
    useGameStore.getState().startNewGameFromGenerated(makeGenerated())

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    )

    const gridButtons = container.querySelectorAll('div.grid.grid-cols-9.grid-rows-9 > button')
    const firstCell = gridButtons.item(0) as HTMLButtonElement

    await user.click(firstCell)

    expect(firstCell.className).toContain('ring-slate-900')
  })
})
