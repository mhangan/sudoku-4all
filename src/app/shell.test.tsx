import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from './shell'

describe('AppShell', () => {
  it('renders title', () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    )

    expect(screen.getByText('Sudoku 4 All')).toBeInTheDocument()
  })
})
