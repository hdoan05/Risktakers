// Verifies: US-006 (AC-017, AC-018, AC-019)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../../src/pages/Home.jsx'
import { makeData } from '../testUtils.jsx'

const state = vi.hoisted(() => ({ data: null }))

vi.mock('../../src/data/DataProvider.jsx', () => ({
  useData: () => state.data,
}))

describe('Home page', () => {
  beforeEach(() => {
    state.data = makeData()
  })

  it('renders the Current Bets and Leaderboard headings', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: 'Current Bets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Leaderboard (top 5)' })).toBeInTheDocument()
  })

  it('shows only the events the user has a bet on', () => {
    const { container } = render(<Home />)
    const cards = container.querySelectorAll('.ev-card')
    expect(cards).toHaveLength(state.data.myBetEventIds.length)

    const titles = [...cards].map((c) => c.querySelector('.ev-card-title').textContent)
    expect(titles).toEqual(['Hokies vs Cavaliers', 'Homecoming King or Queen', 'Snow Before Thanksgiving Break?'])
  })

  it('shows no bet cards when the user has no bets', () => {
    state.data = makeData({ myBetEventIds: [] })
    const { container } = render(<Home />)
    expect(container.querySelectorAll('.ev-card')).toHaveLength(0)
  })

  it('ignores bet ids that do not match an event', () => {
    state.data = makeData({ myBetEventIds: [9999] })
    const { container } = render(<Home />)
    expect(container.querySelectorAll('.ev-card')).toHaveLength(0)
  })

  it('renders the leaderboard table inside the page', () => {
    render(<Home />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Maya K.')).toBeInTheDocument()
  })
})
