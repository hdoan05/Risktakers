// Verifies: US-001 (AC-001, AC-002, AC-003, AC-004)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Events from '../../src/pages/Events.jsx'
import { makeData } from '../testUtils.jsx'

const state = vi.hoisted(() => ({ data: null }))

vi.mock('../../src/data/DataProvider.jsx', () => ({
  useData: () => state.data,
}))

describe('Events page', () => {
  beforeEach(() => {
    state.data = makeData()
  })

  it('renders the page heading and subtitle', () => {
    render(<Events />)
    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument()
    expect(screen.getByText(/No real money, just bragging rights/)).toBeInTheDocument()
  })

  it('builds an All tab plus one tab per distinct category, in first-seen order', () => {
    render(<Events />)
    const tabs = [...document.querySelectorAll('.ev-tab')].map((b) => b.textContent)
    expect(tabs).toEqual([
      'All',
      'Football',
      'Campus',
      'Basketball',
      'Esports',
    ])
  })

  it('starts on All with every event card visible', () => {
    const { container } = render(<Events />)
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('ev-tab--active')
    expect(container.querySelectorAll('.ev-card')).toHaveLength(state.data.events.length)
  })

  it('filters down to the selected category', async () => {
    const user = userEvent.setup()
    const { container } = render(<Events />)

    await user.click(screen.getByRole('button', { name: 'Campus' }))

    const campusEvents = state.data.events.filter((e) => e.category === 'Campus')
    expect(container.querySelectorAll('.ev-card')).toHaveLength(campusEvents.length)
    expect(screen.getByRole('button', { name: 'Campus' })).toHaveClass('ev-tab--active')
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('ev-tab--active')
  })

  it('returns to the full list when All is reselected', async () => {
    const user = userEvent.setup()
    const { container } = render(<Events />)

    await user.click(screen.getByRole('button', { name: 'Football' }))
    expect(container.querySelectorAll('.ev-card')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(container.querySelectorAll('.ev-card')).toHaveLength(state.data.events.length)
  })

  it('omits the Esports tab when no event uses that category', () => {
    state.data = makeData({
      events: state.data.events.filter((e) => e.category !== 'Esports'),
    })
    render(<Events />)
    expect(screen.queryByRole('button', { name: 'Esports' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Campus' })).toBeInTheDocument()
  })

  it('renders an empty grid when there are no events at all', () => {
    state.data = makeData({ events: [] })
    const { container } = render(<Events />)
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['All'])
    expect(container.querySelectorAll('.ev-card')).toHaveLength(0)
  })
})
