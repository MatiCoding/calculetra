import type { ReactNode } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { useProfile } from '../useProfile'
import { ProfileContext } from './ProfileContext'

// Loads the profile of the logged in user once, so the header and the account page share it.
// It must be inside AuthProvider.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { profile, failed, setProfile } = useProfile(user?.id)

  return (
    <ProfileContext.Provider value={{ profile, failed, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}