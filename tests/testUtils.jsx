import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { events, leaderboard, currentUser, myBetEventIds } from '../src/data/mockData.js'

// Fresh copy of the mock dataset in the same shape DataProvider exposes.
export function makeData(overrides = {}) {
  return {
    events,
    leaderboard,
    currentUser,
    myBetEventIds,
    ...overrides,
  }
}

// Renders `ui` inside a router. Pass `route` to control the current path.
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}
