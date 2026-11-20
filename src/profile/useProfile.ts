import { useEffect, useState } from "react";
import { getProfile, type Profile } from "./api/profile";

// Loads the profile of the user. 'profile' is null while it loads (or if there is no user).
// After saving, the page calls setProfile with the saved profile, so the card and the form show it without loading it again.
export function useProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        if (!userId) return
        // If the user changes (or the page closes) before the answer arrives, that old answer must not be shown.
        let ignore = false
        getProfile(userId).then(
            (loaded) => {
                if (!ignore) setProfile(loaded)
            }, () => {
                if (!ignore) setFailed(true)
            },
        )
        return () => {
            ignore = true
        }
    }, [userId])

    return {profile, setProfile, failed}
}