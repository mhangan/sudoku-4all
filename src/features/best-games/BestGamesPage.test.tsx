import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BestGamesPage } from './BestGamesPage'
import { useBestGamesStore } from '../../state/useBestGamesStore'
import { BEST_GAMES_KEY, CURRENT_GAME_KEY } from '../../persistence/storage'

function resetState(): void {
  useBestGamesStore.setState(useBestGamesStore.getInitialState(), true)
  localStorage.removeItem(BEST_GAMES_KEY)
  localStorage.removeItem(CURRENT_GAME_KEY)
}

describe('BestGamesPage integration', () => {
  beforeEach(() => {
    resetState()
    vi.clearAllMocks()
  })

  it('renders loaded records with highlight for newest record', async () => {
    useBestGamesStore.getState().addRecord({
      difficulty: 'hard',
      elapsedSeconds: 95,
      cheated: false,
    })

    render(<BestGamesPage />)

    expect(await screen.findByText('#1')).toBeInTheDocument()
    const item = screen.getByText('#1').closest('li')
    expect(item?.className).toContain('bg-emerald-50')
    expect(screen.getByText('01:35')).toBeInTheDocument()
    expect(screen.getByText('clean')).toBeInTheDocument()
  })

  it('keeps records when clear confirmation is declined', async () => {
    const user = userEvent.setup()
    useBestGamesStore.getState().addRecord({
      difficulty: 'easy',
      elapsedSeconds: 80,
      cheated: true,
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<BestGamesPage />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(useBestGamesStore.getState().records).toHaveLength(1)
  })

  it('clears records when confirmation is accepted', async () => {
    const user = userEvent.setup()
    useBestGamesStore.getState().addRecord({
      difficulty: 'medium',
      elapsedSeconds: 70,
      cheated: false,
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<BestGamesPage />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(useBestGamesStore.getState().records).toHaveLength(0)
    expect(await screen.findByText('No completed games yet.')).toBeInTheDocument()
  })
})
