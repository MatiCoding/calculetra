// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AccountIcon, { type AccountIconName } from './AccountIcon'

const NAMES: AccountIconName[] = ['summary', 'password', 'email', 'delete']

describe('AccountIcon', () => {
    afterEach(cleanup)

    it.each(NAMES)('draws the %s icon', (name) => {
        const { container } = render(<AccountIcon name={name} />)

        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        // Something is drawn inside, not an empty svg.
        expect(svg?.children.length).toBeGreaterThan(0)
    })

    it('is hidden from screen readers', () => {
        const { container } = render(<AccountIcon name="email" />)

        expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    })

    it('takes the color of the text', () => {
        const { container } = render(<AccountIcon name="delete" />)

        expect(container.querySelector('svg')?.getAttribute('stroke')).toBe('currentColor')
    })
})
