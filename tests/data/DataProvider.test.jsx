// Verifies: US-008 (AC-026, AC-027, AC-028)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataProvider, useData } from '../../src/data/DataProvider.jsx'

const supa = vi.hoisted(() => ({ supabase: null, supabaseConfigError: null }))
const api = vi.hoisted(() => ({ fetchAppData: vi.fn() }))

vi.mock('../../src/lib/supabase.js', () => ({
  get supabase() {
    return supa.supabase
  },
  get supabaseConfigError() {
    return supa.supabaseConfigError
  },
}))

vi.mock('../../src/data/api.js', () => ({
  fetchAppData: (...args) => api.fetchAppData(...args),
}))

function Probe() {
  const { events, myBetEventIds, currentUser } = useData()
  return (
    <p>
      events:{events.length} bets:{myBetEventIds.length} user:{currentUser.name}
    </p>
  )
}

describe('DataProvider', () => {
  beforeEach(() => {
    supa.supabase = null
    supa.supabaseConfigError = null
    api.fetchAppData.mockReset()
  })

  it('renders children immediately from mock data when Supabase is not configured', () => {
    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    )
    expect(screen.getByText('events:7 bets:3 user:JD')).toBeInTheDocument()
    expect(api.fetchAppData).not.toHaveBeenCalled()
  })

  it('shows the configuration error instead of the children', () => {
    supa.supabaseConfigError = new Error('Invalid URL')
    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    )
    expect(
      screen.getByText("Couldn't load data from Supabase: Invalid URL")
    ).toHaveClass('page')
    expect(screen.queryByText(/events:/)).toBeNull()
  })

  it('shows a loading state while Supabase data is being fetched', () => {
    supa.supabase = { from: vi.fn() }
    api.fetchAppData.mockReturnValue(new Promise(() => {}))

    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    )

    expect(screen.getByText('Loading…')).toHaveClass('muted')
    expect(api.fetchAppData).toHaveBeenCalledTimes(1)
  })

  it('provides fetched Supabase data to children', async () => {
    supa.supabase = { from: vi.fn() }
    api.fetchAppData.mockResolvedValue({
      events: [],
      leaderboard: [{ rank: 1 }],
      currentUser: { name: 'Remote' },
      myBetEventIds: [4, 5],
    })

    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    )

    expect(await screen.findByText('events:0 bets:2 user:Remote')).toBeInTheDocument()
  })

  it('shows the fetch error message when loading from Supabase fails', async () => {
    supa.supabase = { from: vi.fn() }
    api.fetchAppData.mockRejectedValue(new Error('network down'))

    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    )

    expect(
      await screen.findByText("Couldn't load data from Supabase: network down")
    ).toBeInTheDocument()
    expect(screen.queryByText(/events:/)).toBeNull()
  })
})
