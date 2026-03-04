import { test, expect } from '@playwright/test'

test('loads app shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Sudoku 4 All')).toBeVisible()
  await expect(page.getByText('Choose difficulty')).toBeVisible()
})

test('resume prompt and best-games clear confirmation flow', async ({ page }) => {
  await page.addInitScript(() => {
    const currentGame = {
      version: '1.0.0',
      puzzle: Array.from({ length: 81 }, (_, index) => (index === 0 ? 0 : 1)),
      solution: Array.from({ length: 81 }, () => 1),
      answers: Array.from({ length: 81 }, () => 0),
      annotations: Array.from({ length: 81 }, () => []),
      hintLocked: Array.from({ length: 81 }, () => false),
      difficulty: 'easy',
      startedAt: new Date().toISOString(),
      elapsedSeconds: 17,
      inputMode: 'cell-first',
      annotationMode: false,
      cheated: false,
    }

    const bestGames = {
      version: '1.0.0',
      records: [
        {
          id: 'e2e-record-1',
          difficulty: 'easy',
          completedAt: new Date().toISOString(),
          elapsedSeconds: 45,
          cheated: false,
        },
      ],
    }

    localStorage.setItem('sudoku4all_current', JSON.stringify(currentGame))
    localStorage.setItem('sudoku4all_bestgames', JSON.stringify(bestGames))
  })

  await page.goto('/')
  await expect(page.getByText('Resume saved game?')).toBeVisible()
  await page.getByRole('button', { name: 'Discard' }).click()
  await expect(page.getByText('Choose difficulty')).toBeVisible()

  await page.getByRole('link', { name: 'Best Games' }).click()
  await expect(page.getByText('#1')).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.dismiss()
  })
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(page.getByText('#1')).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(page.getByText('No completed games yet.')).toBeVisible()
})

test('validate and hint confirmations during gameplay', async ({ page }) => {
  await page.addInitScript(() => {
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

    const puzzle = [...solved]
    puzzle[0] = 0

    const currentGame = {
      version: '1.0.0',
      puzzle,
      solution: solved,
      answers: [...puzzle],
      annotations: Array.from({ length: 81 }, () => []),
      hintLocked: Array.from({ length: 81 }, () => false),
      difficulty: 'easy',
      startedAt: new Date().toISOString(),
      elapsedSeconds: 12,
      inputMode: 'cell-first',
      annotationMode: false,
      cheated: false,
    }

    localStorage.setItem('sudoku4all_current', JSON.stringify(currentGame))
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByText('Current Session')).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.dismiss()
  })
  await page.getByRole('button', { name: 'Validate' }).click()
  await expect(page.getByText('Cheated session')).toHaveCount(0)

  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Validate' }).click()
  await expect(page.getByText('Cheated session')).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Resume' }).click()

  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Hint' }).click()
  await expect(page.getByText('Please select a cell first.')).toHaveCount(0)

  await page.locator('div.grid.grid-cols-9.grid-rows-9 button').first().click()

  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Hint' }).click()
  await expect(page.getByText('Cheated session')).toBeVisible()
})

test('completion panel actions for new game and best games', async ({ page }) => {
  await page.addInitScript(() => {
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

    const completedGame = {
      version: '1.0.0',
      puzzle: solved,
      solution: solved,
      answers: solved,
      annotations: Array.from({ length: 81 }, () => []),
      hintLocked: Array.from({ length: 81 }, () => false),
      difficulty: 'easy',
      startedAt: new Date().toISOString(),
      elapsedSeconds: 90,
      inputMode: 'cell-first',
      annotationMode: false,
      cheated: false,
    }

    localStorage.setItem('sudoku4all_current', JSON.stringify(completedGame))
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByText('Congratulations!')).toBeVisible()

  await page.getByRole('button', { name: 'View best games' }).click()
  await expect(page.getByRole('heading', { name: 'Best Games' })).toBeVisible()

  await page.getByRole('link', { name: 'Game', exact: true }).click()
  await expect(page.getByText('Congratulations!')).toBeVisible()

  await page.getByRole('button', { name: 'Start new game' }).click()
  await expect(page.getByText('Congratulations!')).toHaveCount(0)
})
