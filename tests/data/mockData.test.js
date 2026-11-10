// Verifies: US-008 (AC-031)
import { describe, expect, it } from 'vitest'
import {
  currentBets,
  currentUser,
  events,
  leaderboard,
  myBetEventIds,
  upcomingEvents,
} from '../../src/data/mockData.js'

describe('mockData: events', () => {
  it('builds one event entry per upcoming event', () => {
    expect(events).toHaveLength(upcomingEvents.length)
    expect(events.map((e) => e.id)).toEqual(upcomingEvents.map((e) => e.id))
  })

  it('merges the upcoming summary with the detail record', () => {
    const hokies = events.find((e) => e.id === 1)
    expect(hokies).toMatchObject({
      day: '21',
      month: 'SEP',
      title: 'Hokies vs Cavaliers',
      subtitle: 'Football · 3:30 PM',
      tag: 'LIVE',
      tagColor: 'primary',
      category: 'Football',
      closes: 'Closes today, 6:30 PM',
      volume: 48200,
    })
    expect(hokies.options).toEqual([
      { label: 'VT', probability: 62, change: 4.1, probHistory: [51, 54, 53, 57, 59, 62] },
      { label: 'UVA', probability: 38, change: -4.1, probHistory: [49, 46, 47, 43, 41, 38] },
    ])
  })

  it('gives every event the full merged shape the components read', () => {
    for (const event of events) {
      expect(typeof event.title).toBe('string')
      expect(typeof event.subtitle).toBe('string')
      expect(['primary', 'secondary', 'accent']).toContain(event.tagColor)
      expect(event.closes).toMatch(/^Closes /)
      expect(event.volume).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(event.options)).toBe(true)
    }
  })

  it('keeps every option probability within 0-100', () => {
    for (const event of events) {
      for (const option of event.options) {
        expect(option.probability).toBeGreaterThanOrEqual(0)
        expect(option.probability).toBeLessThanOrEqual(100)
      }
    }
  })

  it('gives every event at least one option', () => {
    for (const event of events) {
      expect(event.options.length).toBeGreaterThan(0)
    }
  })

  it('lists exactly the events the demo user has bet on', () => {
    expect(myBetEventIds).toEqual([1, 4, 6])
    const known = new Set(events.map((e) => e.id))
    expect(myBetEventIds.every((id) => known.has(id))).toBe(true)
  })
})

describe('mockData: leaderboard and current user', () => {
  it('ranks the leaderboard by descending points', () => {
    const points = leaderboard.map((p) => p.points)
    expect(points).toEqual([...points].sort((a, b) => b - a))
  })

  it('numbers leaderboard ranks from 1 without gaps', () => {
    expect(leaderboard.map((p) => p.rank)).toEqual([1, 2, 3, 4, 5])
  })

  it('uses only up/down trends', () => {
    for (const p of leaderboard) {
      expect(['up', 'down']).toContain(p.trend)
    }
  })

  it('gives the current user a balance below the last ranked player', () => {
    const last = leaderboard[leaderboard.length - 1]
    expect(currentUser.balance).toBeLessThan(last.points)
    expect(currentUser.rank).toBeGreaterThan(last.rank)
    expect(currentUser.pointsHistory.at(-1)).toBe(currentUser.balance)
  })

  it('exposes current bets in the same shape as detail options', () => {
    expect(currentBets).toHaveLength(4)
    for (const bet of currentBets) {
      expect(bet.options.length).toBeGreaterThan(0)
      for (const option of bet.options) {
        expect(typeof option.label).toBe('string')
        expect(option.odds).toMatch(/^[+-]\d+$/)
      }
    }
  })
})
