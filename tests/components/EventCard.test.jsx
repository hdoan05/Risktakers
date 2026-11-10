// Verifies: US-002 (AC-005, AC-006, AC-007, AC-008, AC-009), US-003 (AC-010, AC-011)
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventCard from '../../src/components/EventCard.jsx'

const event = {
  id: 1,
  day: '21',
  month: 'SEP',
  title: 'Hokies vs Cavaliers',
  subtitle: 'Football · 3:30 PM',
  tag: 'LIVE',
  tagColor: 'primary',
  category: 'Football',
  closes: 'Closes today, 6:30 PM',
  volume: 48200,
  options: [
    { label: 'VT', probability: 62, change: 4.1, probHistory: [51, 54, 53, 57, 59, 62] },
    { label: 'UVA', probability: 38, change: -4.1, probHistory: [49, 46, 47, 43, 41, 38] },
  ],
}

describe('EventCard', () => {
  it('renders the event header, title, and subtitle', () => {
    render(<EventCard event={event} />)
    expect(screen.getByText('LIVE')).toHaveClass('ev-tag', 'ev-tag--primary')
    expect(screen.getByText('Football')).toHaveClass('ev-category')
    expect(screen.getByRole('heading', { name: 'Hokies vs Cavaliers' })).toBeInTheDocument()
    expect(screen.getByText('Football · 3:30 PM')).toBeInTheDocument()
  })

  it('renders one button per option with its probability', () => {
    render(<EventCard event={event} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('VT')
    expect(buttons[0]).toHaveTextContent('62%')
    expect(buttons[1]).toHaveTextContent('UVA')
    expect(buttons[1]).toHaveTextContent('38%')
  })

  it('sets the probability bar width from the option probability', () => {
    const { container } = render(<EventCard event={event} />)
    const fills = container.querySelectorAll('.ev-option-bar-fill')
    expect(fills).toHaveLength(2)
    expect(fills[0]).toHaveStyle({ width: '62%' })
    expect(fills[1]).toHaveStyle({ width: '38%' })
  })

  it('shows an up arrow with the absolute change for positive moves', () => {
    render(<EventCard event={event} />)
    expect(screen.getByText(/▲ 4\.1%/)).toHaveClass('ev-option-change--up')
  })

  it('shows a down arrow for negative moves', () => {
    render(<EventCard event={event} />)
    expect(screen.getByText(/▼ 4\.1%/)).toHaveClass('ev-option-change--down')
  })

  it('toggles selection when an option is clicked', async () => {
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    const vt = screen.getByRole('button', { name: /VT/ })

    expect(vt).toHaveAttribute('aria-pressed', 'false')
    await user.click(vt)
    expect(vt).toHaveAttribute('aria-pressed', 'true')
    expect(vt).toHaveClass('ev-option--selected')

    await user.click(vt)
    expect(vt).toHaveAttribute('aria-pressed', 'false')
    expect(vt).not.toHaveClass('ev-option--selected')
  })

  it('moves the selection when a different option is clicked', async () => {
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    const vt = screen.getByRole('button', { name: /VT/ })
    const uva = screen.getByRole('button', { name: /UVA/ })

    await user.click(vt)
    await user.click(uva)

    expect(vt).toHaveAttribute('aria-pressed', 'false')
    expect(uva).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders the footer with closing time and formatted volume', () => {
    render(<EventCard event={event} />)
    expect(screen.getByText('Closes today, 6:30 PM')).toHaveClass('muted')
    expect(screen.getByText('48,200 pts traded')).toHaveClass('muted')
  })

  it('omits the options block and handles zero volume when there are no options', () => {
    const { container } = render(
      <EventCard
        event={{ ...event, id: 99, options: [], volume: 0, closes: '21 SEP' }}
      />
    )
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(container.querySelector('.ev-options')).toBeNull()
    expect(screen.getByText('0 pts traded')).toBeInTheDocument()
  })

  it('gives each option a sparkline', () => {
    const { container } = render(<EventCard event={event} />)
    expect(container.querySelectorAll('svg.ev-spark')).toHaveLength(2)
  })
})
