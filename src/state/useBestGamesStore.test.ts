import { beforeEach, describe, expect, it } from 'vitest'
import { useBestGamesStore } from './useBestGamesStore'
import { BEST_GAMES_KEY, CURRENT_GAME_KEY } from '../persistence/storage'

function resetStores(): void {
  useBestGamesStore.setState(useBestGamesStore.getInitialState(), true)
  localStorage.removeItem(BEST_GAMES_KEY)
  localStorage.removeItem(CURRENT_GAME_KEY)
}

describe('useBestGamesStore', () => {
  beforeEach(() => {
    resetStores()
  })

  it('sorts records by elapsed time and caps to 50', () => {
    for (let index = 0; index < 55; index += 1) {
      useBestGamesStore.getState().addRecord({
        difficulty: 'easy',
        elapsedSeconds: 100 - index,
        cheated: false,
      })
    }

    const { records } = useBestGamesStore.getState()
    expect(records).toHaveLength(50)

    for (let index = 1; index < records.length; index += 1) {
      expect(records[index].elapsedSeconds).toBeGreaterThanOrEqual(records[index - 1].elapsedSeconds)
    }
  })

  it('tracks newly added record id for highlighting', () => {
    useBestGamesStore.getState().addRecord({
      difficulty: 'medium',
      elapsedSeconds: 42,
      cheated: true,
    })

    const { recentRecordId, records } = useBestGamesStore.getState()
    expect(recentRecordId).not.toBeNull()
    expect(records.some((record) => record.id === recentRecordId)).toBe(true)
  })

  it('loads records from localStorage', () => {
    useBestGamesStore.getState().addRecord({
      difficulty: 'hard',
      elapsedSeconds: 88,
      cheated: false,
    })

    useBestGamesStore.setState({ records: [], recentRecordId: null })
    useBestGamesStore.getState().loadRecords()

    expect(useBestGamesStore.getState().records).toHaveLength(1)
    expect(useBestGamesStore.getState().records[0].difficulty).toBe('hard')
  })

  it('preserves recent highlight id when loading records containing it', () => {
    useBestGamesStore.getState().addRecord({
      difficulty: 'easy',
      elapsedSeconds: 64,
      cheated: false,
    })

    const recentRecordId = useBestGamesStore.getState().recentRecordId
    expect(recentRecordId).not.toBeNull()

    useBestGamesStore.getState().loadRecords()

    expect(useBestGamesStore.getState().recentRecordId).toBe(recentRecordId)
  })
})
