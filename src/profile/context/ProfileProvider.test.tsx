// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthContextValue } from '../../auth/context/AuthContext'
import { fakeUser } from '../../test/fakeUser'
import { fakeProfile } from '../../test/fakeProfile'
import { getProfile, type Profile } from '../api/profile'
import { ProfileProvider } from './ProfileProvider'
import { useMyProfile } from './useMyProfile'

// Each test changes `auth` before rendering, so the fake useAuth returns the user that test needs.
const { auth } = vi.hoisted(() => ({
  auth: {} as AuthContextValue,
}))

vi.mock('../../auth/context/useAuth', () => ({
  useAuth: () => auth,
}))

vi.mock('../api/profile', () => ({
  getProfile: vi.fn(),
}))

// Two tiny components that use the same profile, like the header and the account page.
function ShowNickname() {
  const { profile, failed } = useMyProfile()
  if (failed) return <p>failed</p>
  return <p>{profile ? profile.nickname : 'no profile'}</p>
}

function SaveButton({ saved }: { saved: Profile }) {
  const { setProfile } = useMyProfile()
  return <button type="button" onClick={() => setProfile(saved)}>Guardar</button>
}

describe('ProfileProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.user = fakeUser({ id: 'user-1' })
    auth.loading = false
  })

  afterEach(cleanup)

  it('loads the profile of the logged in user', async () => {
    vi.mocked(getProfile).mockResolvedValue(fakeProfile({ id: 'user-1', nickname: 'mateo' }))

    render(<ProfileProvider><ShowNickname /></ProfileProvider>)

    expect(screen.getByText('no profile')).toBeTruthy()
    expect(await screen.findByText('mateo')).toBeTruthy()
    expect(getProfile).toHaveBeenCalledWith('user-1')
  })

  it('loads nothing when nobody is logged in', () => {
    auth.user = null

    render(<ProfileProvider><ShowNickname /></ProfileProvider>)

    expect(screen.getByText('no profile')).toBeTruthy()
    expect(getProfile).not.toHaveBeenCalled()
  })

  it('says it failed when the profile cannot be loaded', async () => {
    vi.mocked(getProfile).mockRejectedValue(new Error('Network down'))

    render(<ProfileProvider><ShowNickname /></ProfileProvider>)

    expect(await screen.findByText('failed')).toBeTruthy()
  })

  it('shows the saved profile to every component that uses it', async () => {
    vi.mocked(getProfile).mockResolvedValue(fakeProfile({ id: 'user-1', nickname: 'mateo' }))

    render(
      <ProfileProvider>
        <ShowNickname />
        <SaveButton saved={fakeProfile({ id: 'user-1', nickname: 'mateo_nuevo' })} />
      </ProfileProvider>,
    )
    await screen.findByText('mateo')

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Guardar' })))

    expect(screen.getByText('mateo_nuevo')).toBeTruthy()
    expect(getProfile).toHaveBeenCalledOnce()
  })
})

describe('useMyProfile', () => {
  it('throws a clear error outside ProfileProvider', () => {
    // React logs the error to the console; silence it to keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useMyProfile())).toThrow(
      'useMyProfile must be used inside a ProfileProvider.',
    )
  })
})
