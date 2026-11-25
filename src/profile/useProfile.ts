import { useEffect, useState, useCallback } from "react";
import { getProfile, type Profile } from "./api/profile";

// What was loaded, and for which user.
type Loaded = {
    userId: string
    profile: Profile | null
    failed: boolean
}

// Loads the profile of the user. 'profile' is null while it loads (or if there is no user).
// After saving, the page calls setProfile with the saved profile, so the card and the form show it without loading it again.
export function useProfile(userId: string | undefined) {
    const [loaded, setLoaded] = useState<Loaded | null>(null)

    useEffect(() => {
        if (!userId) return
        // If the user changes (or the page closes) before the answer arrives, that old answer must not be shown.
        let ignore = false
        getProfile(userId).then(
            (profile) => {
                if (!ignore) setLoaded({ userId, profile, failed: false })
            }, () => {
                if (!ignore) setLoaded({ userId, profile: null, failed: true })
            },
        )
        return () => {
            ignore = true
        }
    }, [userId])

    const setProfile = useCallback((profile: Profile) => {
        if (userId) setLoaded({ userId, profile, failed: false })
    }, [userId])

    // What was loaded for another user (or before logging out) does not count.
    const current = loaded?.userId === userId ? loaded : null

    return { profile: current?.profile ?? null, setProfile, failed: current?.failed ?? false }
}