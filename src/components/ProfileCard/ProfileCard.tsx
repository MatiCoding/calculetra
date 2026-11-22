import type { AuthUser } from '../../auth/api/auth';
import { loginMethodText, memberSinceText, initial } from "./profileText";
import type { CSSProperties } from 'react'
import type { Profile } from '../../profile/api/profile'
import Avatar from '../Avatar/Avatar'
import { AVATAR_PALETTE } from '../Avatar/avatarPalette'
import styles from './ProfileCard.module.css'
import AccountIcon from '../AccountIcon/AccountIcon';
import ProviderLogo from '../SocialButtons/ProviderLogo';

type ProfileCardProps = {
    user: AuthUser
    profile: Profile | null
}

function ProfileCard({ user, profile }: ProfileCardProps) {
    const loginText = loginMethodText(user.providers)
    const color = profile ? AVATAR_PALETTE[profile.avatar.color] : null // The card takes the color of the background of the avatar.
    const colors = color ? ({'--card': color.hex, '--card-dark': color.dark, '--card-text': color.text} as CSSProperties) : undefined

    return (
        <section className={styles.card} style={colors} aria-label="Tu perfil">
            {profile ? (
                <span className={styles.avatar}>
                    <Avatar nickname={profile.nickname} avatar={profile.avatar} />
                </span>
            ) : (
                <span className={styles.tile} aria-hidden="true">{initial(user.email)}</span>
            )}
            {profile && <p className={styles.nickname}>{profile.nickname}</p>}
            <p className={styles.email}>{user.email}</p>
            {loginText && (
                <p className={styles.chip}>
                    {user.providers.map((method) => (
                        <span key={method} className={styles.chipIcon}>
                            {method === 'email' ? <AccountIcon name="email" /> : <ProviderLogo provider={method} />}
                        </span>
                    ))}
                    {loginText}
                </p>
            )}
            <p className={styles.since}>{memberSinceText(user.createdAt)}</p>
        </section>
    )
}

export default ProfileCard