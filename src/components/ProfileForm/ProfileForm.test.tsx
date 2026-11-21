// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isNicknameAvailable, NicknameTakenError, updateProfile } from '../../profile/api/profile'
import { fakeProfile } from '../../test/fakeProfile'
import ProfileForm from './ProfileForm'

// A fake API, so the tests never call Supabase.
vi.mock('../../profile/api/profile', () => ({
  updateProfile: vi.fn(),
  isNicknameAvailable: vi.fn(),
  NicknameTakenError: class NicknameTakenError extends Error {
    constructor() {
      super('Ese nickname ya está cogido.')
    }
  },
}))

const profile = fakeProfile({ id: 'user-1', nickname: 'player_4821' })

function renderForm(onSaved = vi.fn()) {
  render(<ProfileForm profile={profile} onSaved={onSaved} />)
  return onSaved
}

function nicknameField() {
  return screen.getByLabelText('Nickname') as HTMLInputElement
}

function typeNickname(value: string) {
  fireEvent.change(nicknameField(), { target: { value } })
}

function hint() {
  return document.getElementById('nickname-hint')?.textContent
}

function saveButton() {
  return screen.getByRole('button', { name: /Guardar|Guardando/ }) as HTMLButtonElement
}

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isNicknameAvailable).mockResolvedValue(true)
  })

  afterEach(cleanup)

  it('shows the current nickname', () => {
    renderForm()

    expect(nicknameField().value).toBe('player_4821')
    expect(hint()).toBe('Es tu nickname actual.')
  })

  it('shows the avatar with a live preview of the nickname', () => {
    renderForm()

    typeNickname('Mateo')

    expect(screen.getByRole('img', { name: 'Avatar de Mateo' })).toBeTruthy()
  })

  it('explains the rules of the nickname', () => {
    renderForm()

    expect(screen.getByText('De 3 a 20 caracteres: letras, números y _.')).toBeTruthy()
  })

  it('cannot save while nothing has changed', () => {
    renderForm()

    expect(saveButton().disabled).toBe(true)
  })

  describe('while typing', () => {
    it('says what is wrong with an invalid nickname', () => {
      renderForm()

      typeNickname('ma')
      expect(hint()).toBe('Mínimo 3 caracteres.')

      typeNickname('mateo!')
      expect(hint()).toBe('Solo letras, números y _.')
    })

    it('marks the field as invalid and cannot save', () => {
      renderForm()

      typeNickname('ma')

      expect(nicknameField().getAttribute('aria-invalid')).toBe('true')
      expect(saveButton().disabled).toBe(true)
    })

    it('does not ask if an invalid nickname is free', async () => {
      renderForm()

      typeNickname('ma')
      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(isNicknameAvailable).not.toHaveBeenCalled()
    })

    it('says it is checking, then that the nickname is free', async () => {
      renderForm()

      typeNickname('Mateo')
      expect(hint()).toBe('Comprobando…')

      await waitFor(() => expect(hint()).toBe('¡Disponible!'))
      expect(isNicknameAvailable).toHaveBeenCalledWith('user-1', 'Mateo')
      expect(saveButton().disabled).toBe(false)
    })

    it('says when the nickname is taken, and cannot save', async () => {
      vi.mocked(isNicknameAvailable).mockResolvedValue(false)
      renderForm()

      typeNickname('Mateo')

      await waitFor(() => expect(hint()).toBe('Ese nickname ya está cogido.'))
      expect(nicknameField().getAttribute('aria-invalid')).toBe('true')
      expect(saveButton().disabled).toBe(true)
    })

    it('only asks once after a pause, not after every key', async () => {
      renderForm()

      typeNickname('M')
      typeNickname('Ma')
      typeNickname('Mat')
      typeNickname('Mate')
      typeNickname('Mateo')

      await waitFor(() => expect(hint()).toBe('¡Disponible!'))
      expect(isNicknameAvailable).toHaveBeenCalledTimes(1)
    })

    it('checks the nickname without the spaces around it', async () => {
      renderForm()

      typeNickname('  Mateo ')

      await waitFor(() => expect(isNicknameAvailable).toHaveBeenCalledWith('user-1', 'Mateo'))
    })

    it('does not ask about the current nickname', async () => {
      renderForm()

      typeNickname('Mateo')
      typeNickname('player_4821')
      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(isNicknameAvailable).not.toHaveBeenCalled()
      expect(hint()).toBe('Es tu nickname actual.')
    })
  })

  describe('saving', () => {
    it('saves the new nickname with the current avatar', async () => {
      vi.mocked(updateProfile).mockResolvedValue({ ...profile, nickname: 'Mateo' })
      renderForm()
      typeNickname('Mateo')
      await waitFor(() => expect(saveButton().disabled).toBe(false))

      fireEvent.click(saveButton())

      await waitFor(() => expect(updateProfile).toHaveBeenCalledWith('user-1', 'Mateo', profile.avatar))
    })

    it('tells the page the saved profile and says it is saved', async () => {
      const saved = { ...profile, nickname: 'Mateo' }
      vi.mocked(updateProfile).mockResolvedValue(saved)
      const onSaved = renderForm()
      typeNickname('Mateo')
      await waitFor(() => expect(saveButton().disabled).toBe(false))

      fireEvent.click(saveButton())

      expect((await screen.findByRole('status')).textContent).toBe('Perfil guardado')
      expect(onSaved).toHaveBeenCalledWith(saved)
    })

    it('says it is saving and cannot be pressed twice', async () => {
      vi.mocked(updateProfile).mockReturnValue(new Promise(() => {}))
      renderForm()
      typeNickname('Mateo')
      await waitFor(() => expect(saveButton().disabled).toBe(false))

      fireEvent.click(saveButton())

      await waitFor(() => expect(saveButton().textContent).toBe('Guardando…'))
      expect(saveButton().disabled).toBe(true)
    })

    it('shows the nickname as it was saved (without spaces)', async () => {
      vi.mocked(updateProfile).mockResolvedValue({ ...profile, nickname: 'Mateo' })
      renderForm()
      typeNickname(' Mateo ')
      await waitFor(() => expect(saveButton().disabled).toBe(false))

      fireEvent.click(saveButton())

      await waitFor(() => expect(nicknameField().value).toBe('Mateo'))
    })

    it('says the nickname is taken when someone took it before saving', async () => {
      vi.mocked(updateProfile).mockRejectedValue(new NicknameTakenError())
      const onSaved = renderForm()
      typeNickname('Mateo')
      await waitFor(() => expect(saveButton().disabled).toBe(false))

      fireEvent.click(saveButton())

      await waitFor(() => expect(hint()).toBe('Ese nickname ya está cogido.'))
      expect(onSaved).not.toHaveBeenCalled()
      expect(screen.queryByRole('status')).toBeNull()
    })

    it('says when the profile could not be saved', async () => {
      vi.mocked(updateProfile).mockRejectedValue(new Error('Network down'))
      renderForm()
      typeNickname('Mateo')
      await waitFor(() => expect(saveButton().disabled).toBe(false))

      fireEvent.click(saveButton())

      expect((await screen.findByRole('alert')).textContent).toBe(
        'No se ha podido guardar el perfil. Inténtalo de nuevo.',
      )
    })

    it('hides "Perfil guardado" when the nickname changes again', async () => {
      vi.mocked(updateProfile).mockResolvedValue({ ...profile, nickname: 'Mateo' })
      renderForm()
      typeNickname('Mateo')
      await waitFor(() => expect(saveButton().disabled).toBe(false))
      fireEvent.click(saveButton())
      await screen.findByRole('status')

      typeNickname('Mateo2')

      expect(screen.queryByRole('status')).toBeNull()
    })
  })
})
