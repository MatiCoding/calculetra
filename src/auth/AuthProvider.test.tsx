// @vitest-environment jsdom
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, onAuthChange, type AuthUser } from './auth'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

vi.mock('./auth', () => ({
  getCurrentUser: vi.fn(),
  onAuthChange: vi.fn(),
  signUp: vi.fn(),
  logIn: vi.fn(),
}))

// A tiny component that shows what useAuth() returns, so the tests can read it.
function ShowUser() {
  const { user, loading } = useAuth()
  if (loading) return <p>loading</p>
  return <p>{user ? user.email : 'nobody'}</p>
}

const userT: AuthUser = { id: '1', email: 'userT@example.com' }

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(onAuthChange).mockReturnValue(() => {})
  })

  afterEach(() => {
    cleanup()
  })

  it('reports loading, then user null when nobody is logged in', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    render(<AuthProvider><ShowUser /></AuthProvider>)

    expect(screen.getByText('loading')).toBeTruthy()
    expect(await screen.findByText('nobody')).toBeTruthy()
  })

  it('restores the user from a saved session', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(userT)

    render(<AuthProvider><ShowUser /></AuthProvider>)

    expect(await screen.findByText('userT@example.com')).toBeTruthy()
  })

  it('updates the user when onAuthChange reports a login or logout', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)
    let notify: (user: AuthUser | null) => void = () => {}
    vi.mocked(onAuthChange).mockImplementation((callback) => {
      notify = callback
      return () => {}
    })

    render(<AuthProvider><ShowUser /></AuthProvider>)
    await screen.findByText('nobody')

    act(() => notify(userT))
    expect(screen.getByText('userT@example.com')).toBeTruthy()

    act(() => notify(null))
    expect(screen.getByText('nobody')).toBeTruthy()
  })

  it('stops listening when it is removed', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)
    const stop = vi.fn()
    vi.mocked(onAuthChange).mockReturnValue(stop)

    const { unmount } = render(<AuthProvider><ShowUser /></AuthProvider>)
    await screen.findByText('nobody')
    unmount()

    expect(stop).toHaveBeenCalledOnce()
  })

  it('stops loading even if restoring the session fails', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Network error'))

    render(<AuthProvider><ShowUser /></AuthProvider>)

    await waitFor(() => expect(screen.getByText('nobody')).toBeTruthy())
  })
})

describe('useAuth', () => {
  it('throws a clear error outside AuthProvider', () => {
    // React logs the error to the console; silence it to keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used inside an AuthProvider.',
    )
  })
})
