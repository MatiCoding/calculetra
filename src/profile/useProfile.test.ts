// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProfile, type Profile } from './api/profile'
import { useProfile } from './useProfile'

vi.mock('./api/profile', () => ({
  getProfile: vi.fn(),
}))

const profile: Profile = {
  id: 'user-1',
  nickname: 'player_4821',
  avatar: { kind: 'thumb', text: '', expression: 'happy', thumbColor: 'mustard', color: 'blue', style: 'flat' },
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is null while the profile loads', () => {
    vi.mocked(getProfile).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useProfile('user-1'))

    expect(result.current.profile).toBeNull()
    expect(result.current.failed).toBe(false)
  })

  it('loads the profile of the user', async () => {
    vi.mocked(getProfile).mockResolvedValue(profile)

    const { result } = renderHook(() => useProfile('user-1'))

    await waitFor(() => expect(result.current.profile).toEqual(profile))
    expect(getProfile).toHaveBeenCalledWith('user-1')
  })

  it('does not load anything without a user', () => {
    const { result } = renderHook(() => useProfile(undefined))

    expect(getProfile).not.toHaveBeenCalled()
    expect(result.current.profile).toBeNull()
  })

  it('says it failed when the profile cannot be loaded', async () => {
    vi.mocked(getProfile).mockRejectedValue(new Error('Network down'))

    const { result } = renderHook(() => useProfile('user-1'))

    await waitFor(() => expect(result.current.failed).toBe(true))
    expect(result.current.profile).toBeNull()
  })

  it('lets the page replace the profile after saving', async () => {
    vi.mocked(getProfile).mockResolvedValue(profile)
    const { result } = renderHook(() => useProfile('user-1'))
    await waitFor(() => expect(result.current.profile).toEqual(profile))

    const saved = { ...profile, nickname: 'Mateo' }
    act(() => result.current.setProfile(saved))

    expect(result.current.profile).toEqual(saved)
  })

  it('ignores an answer that arrives after the page is closed', async () => {
    let answer: (value: Profile) => void = () => {}
    vi.mocked(getProfile).mockReturnValue(new Promise((resolve) => (answer = resolve)))
    const { result, unmount } = renderHook(() => useProfile('user-1'))

    unmount()
    await act(async () => answer(profile))

    expect(result.current.profile).toBeNull()
  })
})
