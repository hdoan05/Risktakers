// Verifies: US-007 (AC-020, AC-021, AC-022)
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import App from '../src/App.jsx'
import { makeData } from './testUtils.jsx'

const state = vi.hoisted(() => ({ data: null }))

vi.mock('../src/data/DataProvider.jsx', () => ({
  useData: () => state.data,
}))

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<p>home outlet</p>} />
          <Route path="events" element={<p>events outlet</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('App shell', () => {
  beforeEach(() => {
    state.data = makeData()
  })

  it('renders the brand, nav links, and outlet content', () => {
    renderApp()
    expect(screen.getByText('VTRisk')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Leaderboard' })).toHaveAttribute(
      'href',
      '/leaderboard'
    )
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/events')
    expect(screen.getByText('home outlet')).toBeInTheDocument()
  })

  it('shows the current balance with thousands separators', () => {
    renderApp()
    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('2,480')).toHaveClass('accent-text')
  })

  it('highlights the active route with the accent colour', () => {
    renderApp('/events')
    const events = screen.getByRole('link', { name: 'Events' })
    const home = screen.getByRole('link', { name: 'Home' })

    // jsdom drops CSS custom properties from getComputedStyle, so assert on
    // the generated inline style attribute instead.
    expect(events).toHaveAttribute('style', expect.stringContaining('color: var(--color-accent)'))
    expect(events).toHaveAttribute(
      'style',
      expect.stringContaining('border-bottom: 2px solid var(--color-accent)')
    )
    expect(home).toHaveAttribute('style', expect.stringContaining('color: var(--color-text)'))
    expect(home).toHaveAttribute(
      'style',
      expect.stringContaining('border-bottom: 2px solid transparent')
    )
    expect(screen.getByText('events outlet')).toBeInTheDocument()
  })
})
