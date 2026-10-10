import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, logIn, onAuthChange, signUp } from './auth'
import { supabase } from './supabaseClient'

// Replace the real client with a fake one, so the tests never call Supabase
// and do not need environment variables.
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

const supabaseUser = { id: '1', email: 'a@b.com' }
const authUser = { id: '1', email: 'a@b.com' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signUp', () => {
  it('returns the new user as AuthUser', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: supabaseUser, session: null },
      error: null,
    } as never)

    await expect(signUp('a@b.com', 'secret123')).resolves.toEqual(authUser)
  })

  it('returns null when Supabase returns no user', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    } as never)

    await expect(signUp('a@b.com', 'secret123')).resolves.toBeNull()
  })

  it('throws the Supabase error', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('User already registered'),
    } as never)

    await expect(signUp('a@b.com', 'secret123')).rejects.toThrow('User already registered')
  })
})

describe('logIn', () => {
  it('returns the user as AuthUser', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: supabaseUser, session: {} },
      error: null,
    } as never)

    await expect(logIn('a@b.com', 'secret123')).resolves.toEqual(authUser)
  })

  it('throws the Supabase error', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials'),
    } as never)

    await expect(logIn('a@b.com', 'wrong')).rejects.toThrow('Invalid login credentials')
  })
})

describe('getCurrentUser', () => {
  it('returns the user when there is a session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: supabaseUser } },
      error: null,
    } as never)

    await expect(getCurrentUser()).resolves.toEqual(authUser)
  })

  it('returns null when nobody is logged in', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it('throws the Supabase error', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: new Error('Network error'),
    } as never)

    await expect(getCurrentUser()).rejects.toThrow('Network error')
  })
})

describe('onAuthChange', () => {
  // Captures the listener that onAuthChange gives to Supabase, so the test
  // can simulate a login or logout by calling it.
  function setUpListener() {
    const unsubscribe = vi.fn()
    let listener: (event: string, session: unknown) => void = () => {}
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(((
      callback: typeof listener,
    ) => {
      listener = callback
      return { data: { subscription: { unsubscribe } } }
    }) as never)
    return { unsubscribe, emit: (session: unknown) => listener('EVENT', session) }
  }

  it('calls the callback with the user when someone logs in', () => {
    const { emit } = setUpListener()
    const callback = vi.fn()

    onAuthChange(callback)
    emit({ user: supabaseUser })

    expect(callback).toHaveBeenCalledWith(authUser)
  })

  it('calls the callback with null when the user logs out', () => {
    const { emit } = setUpListener()
    const callback = vi.fn()

    onAuthChange(callback)
    emit(null)

    expect(callback).toHaveBeenCalledWith(null)
  })

  it('returns a function that stops listening', () => {
    const { unsubscribe } = setUpListener()

    const stop = onAuthChange(vi.fn())
    expect(unsubscribe).not.toHaveBeenCalled()

    stop()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
