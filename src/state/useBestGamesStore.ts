import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { CompletedGameRecord } from '../domain/sudoku/types'
import { clearBestGames, loadBestGames, saveBestGames } from '../persistence/storage'
import type { Difficulty } from '../domain/sudoku/types'

interface BestGamesState {
  records: CompletedGameRecord[]
  setRecords: (records: CompletedGameRecord[]) => void
  loadRecords: () => void
  addRecord: (payload: { difficulty: Difficulty; elapsedSeconds: number; cheated: boolean }) => void
  clearRecords: () => void
}

export const useBestGamesStore = create<BestGamesState>((set) => ({
  records: [],
  setRecords: (records) => {
    const sorted = [...records]
      .sort((left, right) => left.elapsedSeconds - right.elapsedSeconds)
      .slice(0, 50)

    saveBestGames({
      version: '1.0.0',
      records: sorted,
    })

    set({ records: sorted })
  },
  loadRecords: () => {
    const bestGames = loadBestGames()
    set({ records: bestGames?.records ?? [] })
  },
  addRecord: ({ difficulty, elapsedSeconds, cheated }) =>
    set((state) => {
      const nextRecord: CompletedGameRecord = {
        id: nanoid(),
        difficulty,
        completedAt: new Date().toISOString(),
        elapsedSeconds,
        cheated,
      }

      const records = [...state.records, nextRecord]
        .sort((left, right) => left.elapsedSeconds - right.elapsedSeconds)
        .slice(0, 50)

      saveBestGames({
        version: '1.0.0',
        records,
      })

      return { records }
    }),
  clearRecords: () => {
    clearBestGames()
    set({ records: [] })
  },
}))
