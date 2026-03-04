import { z } from 'zod'
import type { BestGames, InProgressGame } from '../domain/sudoku/types'

export const CURRENT_GAME_KEY = 'sudoku4all_current'
export const BEST_GAMES_KEY = 'sudoku4all_bestgames'

const inProgressGameSchema = z.object({
  version: z.string(),
  puzzle: z.array(z.number()).length(81),
  solution: z.array(z.number()).length(81),
  answers: z.array(z.number()).length(81),
  annotations: z.array(z.array(z.number())).length(81),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  startedAt: z.string(),
  elapsedSeconds: z.number(),
  inputMode: z.enum(['cell-first', 'number-first']),
  annotationMode: z.boolean(),
  cheated: z.boolean(),
})

const bestGamesSchema = z.object({
  version: z.string(),
  records: z.array(
    z.object({
      id: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
      completedAt: z.string(),
      elapsedSeconds: z.number(),
      cheated: z.boolean(),
    })
  ),
})

export function loadCurrentGame(): InProgressGame | null {
  try {
    const raw = localStorage.getItem(CURRENT_GAME_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const result = inProgressGameSchema.safeParse(parsed)
    return result.success ? (result.data as InProgressGame) : null
  } catch {
    return null
  }
}

export function saveCurrentGame(game: InProgressGame): void {
  localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game))
}

export function clearCurrentGame(): void {
  localStorage.removeItem(CURRENT_GAME_KEY)
}

export function loadBestGames(): BestGames | null {
  try {
    const raw = localStorage.getItem(BEST_GAMES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const result = bestGamesSchema.safeParse(parsed)
    return result.success ? (result.data as BestGames) : null
  } catch {
    return null
  }
}

export function saveBestGames(bestGames: BestGames): void {
  localStorage.setItem(BEST_GAMES_KEY, JSON.stringify(bestGames))
}

export function clearBestGames(): void {
  localStorage.removeItem(BEST_GAMES_KEY)
}
