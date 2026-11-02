// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { fakeUser } from '../../test/fakeUser'
import ProfileCard from './ProfileCard'

describe('ProfileCard', () => {
    afterEach(cleanup)

    it('is a region called "Tu perfil"', () => {
        render(<ProfileCard user={fakeUser()} />)

        expect(screen.getByRole('region', { name: 'Tu perfil' })).toBeTruthy()
    })

    it("shows the user's email", () => {
        render(<ProfileCard user={fakeUser({ email: 'ana@example.com' })} />)

        expect(screen.getByText('ana@example.com')).toBeTruthy()
    })

    it('shows the first letter of the email, hidden from screen readers', () => {
        render(<ProfileCard user={fakeUser({ email: 'ana@example.com' })} />)

        expect(screen.getByText('A').getAttribute('aria-hidden')).toBe('true')
    })

    it('says how the user logs in', () => {
        render(<ProfileCard user={fakeUser({ providers: ['google'] })} />)

        expect(screen.getByText('Entras con Google')).toBeTruthy()
    })

    it('does not say how the user logs in when we do not know it', () => {
        render(<ProfileCard user={fakeUser({ providers: [] })} />)

        expect(screen.queryByText(/Entras con/)).toBeNull()
    })

    it('says since when the user is a member', () => {
        render(<ProfileCard user={fakeUser({ createdAt: '2026-10-15T12:00:00Z' })} />)

        expect(screen.getByText('Miembro desde octubre de 2026')).toBeTruthy()
    })
})
