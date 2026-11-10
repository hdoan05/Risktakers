// Verifies: US-004 (AC-015)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Leaderboard from '../../src/pages/Leaderboard.jsx'
import { makeData } from '../testUtils.jsx'

const state = vi.hoisted(() => ({ data: null }))

vi.mock('../../src/data/DataProvider.jsx', () => ({
  useData: () => state.data,
}))

describe('Leaderboard page', () => {
  beforeEach(() => {
    state.data = makeData()
  })

  it('renders the page heading and subtitle', () => {
    render(<Leaderboard />)
    expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument()
    expect(screen.getByText(/Ranked by total points earned/)).toBeInTheDocument()
  })

  it('renders the shared leaderboard table', () => {
    const { container } = render(<Leaderboard />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    // Ranks 1, 2 and 4 rise; ranks 3 and 5 fall.
    expect(container.querySelectorAll('tbody .lb-trend--up')).toHaveLength(3)
    expect(container.querySelectorAll('tbody .lb-trend--down')).toHaveLength(2)
    expect(container.querySelector('.lb-you-row .lb-trend--up')).toHaveTextContent('▲ 12.4%')
  })
})
