import { test, expect } from '@playwright/test'

test('loads app shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Sudoku 4 All')).toBeVisible()
  await expect(page.getByText('Choose difficulty')).toBeVisible()
})
