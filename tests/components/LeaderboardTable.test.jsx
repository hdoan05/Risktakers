// Verifies: US-004 (AC-012, AC-013, AC-014), US-005 (AC-016)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { makeData } from '../testUtils.jsx'
import LeaderboardTable from '../../src/components/LeaderboardTable.jsx'

const state = vi.hoisted(() => ({ data: null }))

vi.mock('../../src/data/DataProvider.jsx', () => ({
  useData: () => state.data,
}))

describe('LeaderboardTable', () => {
  beforeEach(() => {
    state.data = makeData()
  })

  it('renders the column headers', () => {
    render(<LeaderboardTable />)
    expect(screen.getByRole('columnheader', { name: 'Rank' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Player' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Trend' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Points' })).toBeInTheDocument()
  })

  it('renders one row per leaderboard entry with medals for the top three', () => {
    const { container } = render(<LeaderboardTable />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(5)

    const medals = [...container.querySelectorAll('tbody .lb-medal')].map((m) => m.textContent)
    expect(medals).toEqual(['🥇', '🥈', '🥉', '', ''])
  })

  it('formats each player points total with thousands separators', () => {
    const { container } = render(<LeaderboardTable />)
    const points = [...container.querySelectorAll('tbody .lb-points')].map((p) => p.textContent)
    expect(points).toEqual(['18,920', '17,405', '16,110', '15,860', '14,995'])
  })

  it('shows up and down arrows that match each player trend', () => {
    const { container } = render(<LeaderboardTable />)
    const trends = [...container.querySelectorAll('tbody .lb-trend--up, tbody .lb-trend--down')].map(
      (cell) => [cell.textContent, cell.className]
    )
    expect(trends).toEqual([
      ['▲', 'lb-num lb-trend--up'],
      ['▲', 'lb-num lb-trend--up'],
      ['▼', 'lb-num lb-trend--down'],
      ['▲', 'lb-num lb-trend--up'],
      ['▼', 'lb-num lb-trend--down'],
    ])
  })

  it('shows the current user position and points gap to the last shown rank', () => {
    render(<LeaderboardTable />)
    expect(screen.getByText('Your current position')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByText('You')).toHaveClass('lb-you-tag')
    // 14,995 (rank 5) - 2,480 (user balance) = 12,515
    expect(screen.getByText('12,515 pts behind #5')).toBeInTheDocument()
    expect(screen.getByText('2,480')).toHaveClass('lb-points')
    expect(screen.getByText('47')).toBeInTheDocument()
  })

  it('shows the user trend as up when the change is positive', () => {
    const { container } = render(<LeaderboardTable />)
    const youTrend = container.querySelector('.lb-you-row .lb-trend--up')
    expect(youTrend).toHaveTextContent('▲ 12.4%')
  })

  it('shows the user trend as down with an absolute value when the change is negative', () => {
    state.data = makeData({
      currentUser: { ...makeData().currentUser, changePct: -3.8 },
    })
    const { container } = render(<LeaderboardTable />)
    const youTrend = container.querySelector('.lb-you-row .lb-trend--down')
    expect(youTrend).toHaveTextContent('▼ 3.8%')
    expect(youTrend).not.toHaveTextContent('-3.8')
  })
})
