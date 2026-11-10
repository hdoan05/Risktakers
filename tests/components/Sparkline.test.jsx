// Verifies: US-009 (AC-032, AC-033, AC-034), US-002 (AC-007)
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Sparkline from '../../src/components/Sparkline.jsx'

describe('Sparkline', () => {
  it('renders an aria-hidden svg with the fixed viewBox', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} color="accent" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('viewBox', '0 0 64 22')
    expect(svg).toHaveAttribute('preserveAspectRatio', 'none')
  })

  it('maps the series onto the 64x22 box, lowest value at the bottom', () => {
    const { container } = render(<Sparkline data={[51, 54, 53, 57, 59, 62]} color="primary" />)
    const points = container.querySelector('polyline').getAttribute('points')
    expect(points).toBe('0.0,22.0 12.8,16.0 25.6,18.0 38.4,10.0 51.2,6.0 64.0,0.0')
  })

  it('strokes the line with the option colour variable', () => {
    const { container } = render(<Sparkline data={[1, 2]} color="secondary" />)
    expect(container.querySelector('polyline')).toHaveAttribute(
      'stroke',
      'var(--color-secondary)'
    )
  })

  it('draws a flat line when every value is identical', () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} color="accent" />)
    const points = container.querySelector('polyline').getAttribute('points')
    expect(points).toBe('0.0,22.0 32.0,22.0 64.0,22.0')
  })

  it('renders a single-point series without NaN coordinates', () => {
    const { container } = render(<Sparkline data={[5]} color="accent" />)
    expect(container.querySelector('polyline').getAttribute('points')).toBe('0.0,22.0')
  })

  it('renders an empty series without throwing', () => {
    const { container } = render(<Sparkline data={[]} color="accent" />)
    expect(container.querySelector('polyline')).toHaveAttribute('points', '')
  })
})
