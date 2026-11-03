import type { AuthUser } from '../auth/api/auth'

// A logged-in user for tests. Pass only the fields the test cares about.
export function fakeUser(overrides: Partial<AuthUser> = {}): AuthUser {
    return {
        id: '1',
        email: 'ana@example.com',
        hasPassword: true,
        providers: ['email'],
        createdAt: '2026-10-01T09:30:00Z',
        ...overrides,
    }
}