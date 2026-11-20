import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProfile, isNicknameAvailable, NicknameTakenError, updateProfile, type Avatar } from './profile'
import { supabase } from '../../auth/api/supabaseClient'

// Replace the real client with a fake one, so the tests never call Supabase
// and do not need environment variables.
vi.mock('../../auth/api/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

// supabase.from('profiles').select(...).eq(...)... is a chain of calls.
// This fake chain returns itself from every method and, when awaited (or
// when .single() is called), gives back `result`.
function fakeQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(() => query),
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    neq: vi.fn(() => query),
    ilike: vi.fn(() => query),
    limit: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  }
  vi.mocked(supabase.from).mockReturnValue(query as never)
  return query
}

const row = {
  id: 'user-1',
  nickname: 'player_4821',
  tile_kind: 'thumb',
  tile_text: '',
  thumb_expression: 'happy',
  thumb_color: 'mustard',
  tile_color: 'blue',
  tile_style: 'flat',
}

const avatar: Avatar = {
  kind: 'thumb',
  text: '',
  expression: 'happy',
  thumbColor: 'mustard',
  color: 'blue',
  style: 'flat',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getProfile', () => {
  it('reads the profile of the user from the profiles table', async () => {
    const query = fakeQuery({ data: row, error: null })

    await getProfile('user-1')

    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(query.eq).toHaveBeenCalledWith('id', 'user-1')
    expect(query.single).toHaveBeenCalled()
  })

  it('returns the row as a Profile', async () => {
    fakeQuery({ data: row, error: null })

    await expect(getProfile('user-1')).resolves.toEqual({ id: 'user-1', nickname: 'player_4821', avatar })
  })

  it('throws the Supabase error', async () => {
    fakeQuery({ data: null, error: new Error('Network down') })

    await expect(getProfile('user-1')).rejects.toThrow('Network down')
  })
})

describe('updateProfile', () => {
  const newAvatar: Avatar = { kind: 'text', text: 'MR', expression: 'wink', thumbColor: 'teal', color: 'plum', style: 'outline' }
  const savedRow = {
    id: 'user-1',
    nickname: 'Mateo',
    tile_kind: 'text',
    tile_text: 'MR',
    thumb_expression: 'wink',
    thumb_color: 'teal',
    tile_color: 'plum',
    tile_style: 'outline',
  }

  it('saves the nickname and every avatar field in the row of the user', async () => {
    const query = fakeQuery({ data: savedRow, error: null })

    await updateProfile('user-1', 'Mateo', newAvatar)

    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: 'Mateo',
        tile_kind: 'text',
        tile_text: 'MR',
        thumb_expression: 'wink',
        thumb_color: 'teal',
        tile_color: 'plum',
        tile_style: 'outline',
      }),
    )
    expect(query.eq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('saves when the profile was updated', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-19T20:00:00Z'))
    const query = fakeQuery({ data: savedRow, error: null })

    await updateProfile('user-1', 'Mateo', newAvatar)

    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ updated_at: '2026-11-19T20:00:00.000Z' }))
    vi.useRealTimers()
  })

  it('saves the nickname without the spaces around it', async () => {
    const query = fakeQuery({ data: savedRow, error: null })

    await updateProfile('user-1', '  Mateo ', newAvatar)

    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ nickname: 'Mateo' }))
  })

  it('returns the saved profile', async () => {
    fakeQuery({ data: savedRow, error: null })

    await expect(updateProfile('user-1', 'Mateo', newAvatar)).resolves.toEqual({
      id: 'user-1',
      nickname: 'Mateo',
      avatar: newAvatar,
    })
  })

  it('throws NicknameTakenError when the nickname is already taken', async () => {
    fakeQuery({ data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } })

    const result = updateProfile('user-1', 'Mateo', newAvatar)

    await expect(result).rejects.toBeInstanceOf(NicknameTakenError)
    await expect(result).rejects.toThrow('Ese nickname ya está cogido.')
  })

  it('throws any other Supabase error as it is', async () => {
    fakeQuery({ data: null, error: new Error('Network down') })

    await expect(updateProfile('user-1', 'Mateo', newAvatar)).rejects.toThrow('Network down')
  })
})

describe('isNicknameAvailable', () => {
  it('is true when no other user has the nickname', async () => {
    fakeQuery({ data: [], error: null })

    await expect(isNicknameAvailable('user-1', 'Mateo')).resolves.toBe(true)
  })

  it('is false when another user has the nickname', async () => {
    fakeQuery({ data: [{ id: 'user-2' }], error: null })

    await expect(isNicknameAvailable('user-1', 'Mateo')).resolves.toBe(false)
  })

  it('ignores case and does not count the user asking', async () => {
    const query = fakeQuery({ data: [], error: null })

    await isNicknameAvailable('user-1', 'Mateo')

    expect(query.ilike).toHaveBeenCalledWith('nickname', 'Mateo')
    expect(query.neq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('escapes "_" so it is not a wildcard', async () => {
    const query = fakeQuery({ data: [], error: null })

    await isNicknameAvailable('user-1', 'player_1')

    expect(query.ilike).toHaveBeenCalledWith('nickname', 'player\\_1')
  })

  it('checks the nickname without the spaces around it', async () => {
    const query = fakeQuery({ data: [], error: null })

    await isNicknameAvailable('user-1', ' Mateo  ')

    expect(query.ilike).toHaveBeenCalledWith('nickname', 'Mateo')
  })

  it('throws the Supabase error', async () => {
    fakeQuery({ data: null, error: new Error('Network down') })

    await expect(isNicknameAvailable('user-1', 'Mateo')).rejects.toThrow('Network down')
  })
})
