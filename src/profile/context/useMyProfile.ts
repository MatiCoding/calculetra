import { useContext } from 'react'
import { ProfileContext, type ProfileContextValue } from './ProfileContext'

export function useMyProfile(): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (context === null) {
    throw new Error('useMyProfile must be used inside a ProfileProvider.')
  }
  return context
}