import { Link } from "react-router";
import type { MouseEvent } from "react";
import styles from './BackToGames.module.css'

function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

// Both are optional: other pages (like the account page) use it as a plain link.
type Props = {
    // The game we are leaving, so the home page can put it in the middle.
    game?: string
    // Starts the exit animation. The page goes home when it ends.
    onLeave?: () => void
}

function BackToGames({ game, onLeave }: Props) {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        if (!onLeave) return
        // Ctrl/Cmd + click, middle click...: the browser opens a new tab, without animation.
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
        // Without animations the link goes home at once, but it still says which game it comes from.
        if (prefersReducedMotion()) return
        event.preventDefault()
        onLeave()
    }
    return (
        <Link to="/" state={game ? { from: game } : undefined} onClick={handleClick} className={styles.back}>
            <span aria-hidden="true">←</span> Volver a los juegos
        </Link>
    )
}

export default BackToGames