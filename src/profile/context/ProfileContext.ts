import { createContext } from 'react'
import type { Profile } from '../api/profile'

export type ProfileContextValue = {
  profile: Profile | null
  failed: boolean
  setProfile: (profile: Profile) => void
}

// Only ProfileProvider and useMyProfile use this. Components call useMyProfile() instead.
export const ProfileContext = createContext<ProfileContextValue | null>(null)