// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { fakeUser } from '../../test/fakeUser'
import { fakeProfile } from '../../test/fakeProfile'
import ProfileCard from './ProfileCard'

describe('ProfileCard', () => {
    afterEach(cleanup)

    it('is a region called "Tu perfil"', () => {
        render(<ProfileCard user={fakeUser()} profile={fakeProfile()} />)

        expect(screen.getByRole('region', { name: 'Tu perfil' })).toBeTruthy()
    })

    it("shows the user's email", () => {
        render(<ProfileCard user={fakeUser({ email: 'ana@example.com' })} profile={fakeProfile()} />)

        expect(screen.getByText('ana@example.com')).toBeTruthy()
    })

    it("shows the user's nickname", () => {
        render(<ProfileCard user={fakeUser()} profile={fakeProfile({ nickname: 'mateo' })} />)

        expect(screen.getByText('mateo')).toBeTruthy()
    })

    it("shows the user's avatar", () => {
        render(<ProfileCard user={fakeUser()} profile={fakeProfile({ nickname: 'mateo' })} />)

        expect(screen.getByRole('img', { name: 'Avatar de mateo' })).toBeTruthy()
    })

    it('takes the colour of the background of the avatar', () => {
        render(<ProfileCard user={fakeUser()} profile={fakeProfile({}, { color: 'plum' })} />)

        const card = screen.getByRole('region', { name: 'Tu perfil' })
        expect(card.style.getPropertyValue('--card')).toBe('#7a3e8e')
        expect(card.style.getPropertyValue('--card-dark')).toBe('#552a64')
        expect(card.style.getPropertyValue('--card-text')).toBe('#ffffff')
    })

    it('uses dark text on a light colour', () => {
        render(<ProfileCard user={fakeUser()} profile={fakeProfile({}, { color: 'mustard', thumbColor: 'blue' })} />)

        const card = screen.getByRole('region', { name: 'Tu perfil' })
        expect(card.style.getPropertyValue('--card-text')).toBe('#1f2430')
    })

    it('shows the first letter of the email while the profile loads, hidden from screen readers', () => {
        render(<ProfileCard user={fakeUser({ email: 'ana@example.com' })} profile={null} />)

        expect(screen.getByText('A').getAttribute('aria-hidden')).toBe('true')
        expect(screen.queryByRole('img')).toBeNull()
    })

    it('keeps its usual colour while the profile loads', () => {
        render(<ProfileCard user={fakeUser()} profile={null} />)

        const card = screen.getByRole('region', { name: 'Tu perfil' })
        expect(card.style.getPropertyValue('--card')).toBe('')
    })

    it('says how the user logs in', () => {
        render(<ProfileCard user={fakeUser({ providers: ['google'] })} profile={fakeProfile()} />)

        expect(screen.getByText('Entras con Google')).toBeTruthy()
    })

    it('does not say how the user logs in when we do not know it', () => {
        render(<ProfileCard user={fakeUser({ providers: [] })} profile={fakeProfile()} />)

        expect(screen.queryByText(/Entras con/)).toBeNull()
    })

    it('says since when the user is a member', () => {
        render(<ProfileCard user={fakeUser({ createdAt: '2026-10-15T12:00:00Z' })} profile={fakeProfile()} />)

        expect(screen.getByText('Miembro desde octubre de 2026')).toBeTruthy()
    })

    it('shows an icon for each way of logging in', () => {
        render(<ProfileCard user={fakeUser({ providers: ['email', 'google'] })} profile={fakeProfile()} />)

        const chip = screen.getByText('Entras con correo y contraseña o Google')
        expect(chip.querySelectorAll('svg')).toHaveLength(2)
    })
})
