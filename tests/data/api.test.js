// Verifies: US-008 (AC-029, AC-030)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAppData } from '../../src/data/api.js'

const h = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('../../src/lib/supabase.js', () => ({
  supabase: { from: (...args) => h.from(...args) },
  supabaseConfigError: null,
}))

// Minimal stand-in for a PostgREST builder: chainable, thenable, and
// `single()` also resolves the same payload.
function query(result) {
  const promise = Promise.resolve(result)
  const builder = {
    select: () => builder,
    order: () => builder,
    limit: () => builder,
    eq: () => builder,
    single: () => promise,
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
    catch: (onRejected) => promise.catch(onRejected),
    finally: (onFinally) => promise.finally(onFinally),
  }
  return builder
}

const eventRow = {
  id: 1,
  title: 'Hokies vs Cavaliers',
  subtitle: 'Football · 3:30 PM',
  tag: 'LIVE',
  tag_color: 'primary',
  category: 'Football',
  starts_at: '2026-09-21T19:30:00Z',
  closes_at: '2026-09-21T22:30:00Z',
  volume: 48200,
  event_options: [
    { label: 'VT', probability: 62, change: '4.1', prob_history: [51, 62], sort_order: 1 },
    { label: 'UVA', probability: 38, change: '-4.1', prob_history: [49, 38], sort_order: 2 },
  ],
}

const topRows = [
  { rank: 1, initials: 'MK', display_name: 'Maya K.', detail: 'Junior', points: 18920, change_pct: '5.2' },
  { rank: 2, initials: 'DT', display_name: 'Derek T.', detail: 'Senior', points: 17405, change_pct: '-1.0' },
]

const userRow = {
  id: 'user-1',
  display_name: 'JD',
  points: 2480,
  rank: 47,
  change_pct: '12.4',
  points_history: [1800, 2480, 2200],
}

let leaderboardCalls

function seedSuccess() {
  leaderboardCalls = 0
  h.from.mockImplementation((table) => {
    if (table === 'events') {
      return query({ data: [structuredClone(eventRow)], error: null })
    }
    if (table === 'leaderboard') {
      leaderboardCalls += 1
      return leaderboardCalls === 1
        ? query({ data: topRows, error: null })
        : query({ data: userRow, error: null })
    }
    if (table === 'bets') {
      return query({
        data: [
          { event_options: { event_id: 1 } },
          { event_options: { event_id: 1 } },
          { event_options: { event_id: 4 } },
        ],
        error: null,
      })
    }
    throw new Error(`unexpected table ${table}`)
  })
}

describe('fetchAppData', () => {
  beforeEach(() => {
    h.from.mockReset()
    seedSuccess()
  })

  it('queries events, the top five leaderboard rows, the demo user, and their bets', async () => {
    await fetchAppData()
    expect(h.from.mock.calls.map((c) => c[0])).toEqual([
      'events',
      'leaderboard',
      'leaderboard',
      'bets',
    ])
    expect(leaderboardCalls).toBe(2)
  })

  it('converts event rows into the camelCase mock shape', async () => {
    const { events } = await fetchAppData()
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      id: 1,
      day: '21',
      month: 'SEP',
      title: 'Hokies vs Cavaliers',
      subtitle: 'Football · 3:30 PM',
      tag: 'LIVE',
      tagColor: 'primary',
      category: 'Football',
      closes: 'Closes Sep 21, 6:30 PM',
      volume: 48200,
      options: [
        { label: 'VT', probability: 62, change: 4.1, probHistory: [51, 62] },
        { label: 'UVA', probability: 38, change: -4.1, probHistory: [49, 38] },
      ],
    })
  })

  it('sorts event options by sort_order, not by database return order', async () => {
    h.from.mockImplementation((table) => {
      if (table === 'events') {
        const row = structuredClone(eventRow)
        row.event_options.reverse()
        return query({ data: [row], error: null })
      }
      if (table === 'leaderboard') {
        leaderboardCalls += 1
        return leaderboardCalls === 1
          ? query({ data: topRows, error: null })
          : query({ data: userRow, error: null })
      }
      return query({ data: [], error: null })
    })

    const { events } = await fetchAppData()
    expect(events[0].options.map((o) => o.label)).toEqual(['VT', 'UVA'])
  })

  it('derives leaderboard trends from the sign of change_pct', async () => {
    const { leaderboard } = await fetchAppData()
    expect(leaderboard).toEqual([
      { rank: 1, initials: 'MK', name: 'Maya K.', detail: 'Junior', points: 18920, trend: 'up' },
      { rank: 2, initials: 'DT', name: 'Derek T.', detail: 'Senior', points: 17405, trend: 'down' },
    ])
  })

  it('maps the current user and uses the highest historical points as the peak', async () => {
    const { currentUser } = await fetchAppData()
    expect(currentUser).toEqual({
      name: 'JD',
      balance: 2480,
      rank: 47,
      changePct: 12.4,
      peakThisMonth: 2480,
      pointsHistory: [1800, 2480, 2200],
    })
  })

  it('de-duplicates the bet event ids', async () => {
    const { myBetEventIds } = await fetchAppData()
    expect(myBetEventIds).toEqual([1, 4])
  })

  it('rejects with the database error when a query fails', async () => {
    h.from.mockImplementation(() => query({ data: null, error: { message: 'boom' } }))
    await expect(fetchAppData()).rejects.toEqual({ message: 'boom' })
  })
})
