// Verifies: US-008 (AC-023, AC-024, AC-025)
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('supabase configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('exports no client and no error when the env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')

    const mod = await import('../../src/lib/supabase.js')

    expect(mod.supabase).toBeNull()
    expect(mod.supabaseConfigError).toBeNull()
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("Supabase isn't configured")
    )
  })

  it('exports no client when only the URL is set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')

    const mod = await import('../../src/lib/supabase.js')

    expect(mod.supabase).toBeNull()
    expect(mod.supabaseConfigError).toBeNull()
  })

  it('creates a client when both env vars are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key')

    const mod = await import('../../src/lib/supabase.js')

    expect(mod.supabaseConfigError).toBeNull()
    expect(mod.supabase).not.toBeNull()
    expect(typeof mod.supabase.from).toBe('function')
  })

  it('captures a client-construction error instead of throwing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'not-a-url')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key')

    const mod = await import('../../src/lib/supabase.js')

    expect(mod.supabase).toBeNull()
    expect(mod.supabaseConfigError).toBeInstanceOf(Error)
    expect(console.info).not.toHaveBeenCalled()
  })
})
