import { describe, expect, it } from 'vitest'
import { initial, loginMethodText, memberSinceText } from './profileText'

describe('loginMethodText', () => {
    it('says that the user logs in with email and password', () => {
        expect(loginMethodText(['email'])).toBe('Entras con correo y contraseña')
    })

    it.each([
        ['google', 'Entras con Google'],
        ['github', 'Entras con GitHub'],
    ] as const)('says that the user logs in with %s', (provider, text) => {
        expect(loginMethodText([provider])).toBe(text)
    })

    it('joins two ways of logging in with "o"', () => {
        expect(loginMethodText(['email', 'google'])).toBe('Entras con correo y contraseña o Google')
    })

    it('joins three ways of logging in with commas and "o"', () => {
        expect(loginMethodText(['email', 'google', 'github'])).toBe('Entras con correo y contraseña, Google o GitHub')
    })

    it('returns null when there is no way of logging in', () => {
        expect(loginMethodText([])).toBeNull()
    })
})

describe('memberSinceText', () => {
    // Mid-month dates, so the month is the same in every time zone.
    it('says the month and year the account was created', () => {
        expect(memberSinceText('2026-10-15T12:00:00Z')).toBe('Miembro desde octubre de 2026')
    })

    it('works with other months', () => {
        expect(memberSinceText('2027-03-15T12:00:00Z')).toBe('Miembro desde marzo de 2027')
    })
})

describe('initial', () => {
    it('returns the first letter of the email in upper case', () => {
        expect(initial('ana@example.com')).toBe('A')
    })

    it('returns "?" when there is no email', () => {
        expect(initial('')).toBe('?')
    })
})
