// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { fakeUser } from '../../test/fakeUser'
import AccountSummary from './AccountSummary'

describe('AccountSummary', () => {
    afterEach(cleanup)

    it('says hello with the part of the email before the @', () => {
        render(<AccountSummary user={fakeUser({ email: 'ana@example.com' })} />)

        expect(screen.getByRole('heading', { name: 'Hola, ana' })).toBeTruthy()
    })

    it('shows the three stats that are coming', () => {
        render(<AccountSummary user={fakeUser()} />)

        const stats = screen.getAllByRole('listitem').map((item) => item.textContent)
        expect(stats).toEqual(['–Retos jugados', '–Racha', '–Mejor puntuación'])
    })

    it('says that the stats are not there yet', () => {
        render(<AccountSummary user={fakeUser()} />)

        expect(screen.getByText('Aquí verás tus estadísticas cuando lleguen.')).toBeTruthy()
    })

    it('explains why there is no password to users who log in with a provider', () => {
        render(<AccountSummary user={fakeUser({ hasPassword: false, providers: ['google'] })} />)

        expect(screen.getByText(/no tienes contraseña en Calculetra/)).toBeTruthy()
    })

    it('does not show that note to users with a password', () => {
        render(<AccountSummary user={fakeUser()} />)

        expect(screen.queryByText(/no tienes contraseña en Calculetra/)).toBeNull()
    })
})