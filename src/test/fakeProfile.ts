import type { Profile } from '../profile/api/profile'
import type { Avatar } from '../profile/avatar'

// A profile for tests. Pass only the fields the test cares about.
export function fakeProfile(overrides: Partial<Profile> = {}, avatar: Partial<Avatar> = {}): Profile {
    return {
        id: '1',
        nickname: 'player_4821',
        ...overrides,
        avatar: {
            kind: 'thumb',
            text: '',
            expression: 'happy',
            thumbColor: 'mustard',
            color: 'blue',
            style: 'flat',
            ...avatar,
        },
    }
}