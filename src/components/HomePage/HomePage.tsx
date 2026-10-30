import { getChallengeNumber } from "../../domain/cifras/challengeCifras";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { getActiveIndex } from "./carousel";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import styles from './HomePage.module.css'

import FloatingTiles from "../FloatingTiles/FloatingTiles";
import GameList from "../GameList/GameList";

const GAMES = ['Letras', 'Cifras'] as const // Same order of appareance
const CIFRAS = GAMES.indexOf('Cifras')
const PATHS: Record<string, string> = { Letras: '/letras', Cifras: '/cifras' }
const CARDS = [...GAMES, 'Más retos']

const GROW_MS = 500
const MOBILE = '(max-width: 600px)'

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function HomePage() {
    const navigate = useNavigate()
    const isMobile = useMediaQuery(MOBILE)

    const trackRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(CIFRAS)
    const [opening, setOpening] = useState<{ game: string, from: DOMRect } | null>(null)
    const [pointed, setPointed] = useState<number | null> (null)    // The card under the pointer or with the focus.

    // On every scroll, look for the card in the center of the track.
    function handleScroll(){
        const track = trackRef.current
        if (!track) return 
        const cards = Array.from(track.children as HTMLCollectionOf<HTMLElement>).map((card) => ({
            left: card.offsetLeft,
            width: card.offsetWidth,
        }))
        setActive(getActiveIndex(track.scrollLeft, track.clientWidth, cards))
    }

    // Scrolls the track until the card number index is in the center. The scroll event then updates active.
    function goTo(index: number){
        const card = trackRef.current?.children[index]
        card?.scrollIntoView({behavior: prefersReducedMotion() ? 'auto' : 'smooth', inline:'center', block: 'nearest'})
    }

    // A card on the side first moves to the center, only the card in the center opens its game.
    function handleCardClick(index: number) {
        if (index !== active) {
            goTo(index)
            return
        }
        if (index < GAMES.length) openGame(GAMES[index], trackRef.current?.children[index])
    }

    useLayoutEffect(() => {
        const track = trackRef.current
        const card = track?.children[CIFRAS] as HTMLElement | undefined
        if (!track || !card) return
        track.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2
    }, [isMobile])

    useEffect(() => {
        if (!opening) return
        const timer = setTimeout(() => navigate(PATHS[opening.game]), GROW_MS)
        return () => clearTimeout(timer)
    }, [opening, navigate])

    // Grows the card until it fills the screen and then opens its game.
    function openGame(game: string, card: Element | undefined) {
        if (prefersReducedMotion() || !card){
            navigate(PATHS[game])
            return
        }
        setOpening({ game, from: card.getBoundingClientRect() })
    }

    const grow = opening && (
                <div
                    className={styles.grow}
                    data-testid="grow"
                    data-game={opening.game}
                    aria-hidden="true"
                    style={{
                        top: opening.from.top,
                        left: opening.from.left,
                        width: opening.from.width,
                        height: opening.from.height,
                        animationDuration: `${GROW_MS}ms`,
                    }}
                />
    )

    if (isMobile) {
        return (
            <main className={styles.home}>
                <p className={styles.eyebrow}>Reto nº {getChallengeNumber(new Date())}</p>
                <GameList onPlay={openGame} />
                {grow}
            </main>
        )    
    }

    return (
        <main className={styles.home}>
            <FloatingTiles game={pointed === null ? null : GAMES[pointed]} />
            <p className={styles.eyebrow}>Reto nº {getChallengeNumber(new Date())} · desliza para elegir</p>

            <div className={styles.track} ref={trackRef} onScroll={handleScroll}>

                <button 
                    type="button" 
                    className={`${styles.card} ${styles.letras}`} 
                    data-active={active === 0}
                    onClick={() => handleCardClick(0)}
                    onPointerEnter={() => setPointed(0)}
                    onPointerLeave={() => setPointed(null)}
                    onFocus={() => setPointed(0)}
                    onBlur={() => setPointed(null)}
                >
                    <div>
                        <h2>Letras</h2>
                        <p>Nueve letras para la palabra más larga.</p>
                    </div>
                    <div className={styles.tiles} aria-hidden="true">
                        <span>L</span><span>E</span><span>T</span><span>A</span>
                    </div>
                    <div className={styles.go}>
                        Jugar el reto <b aria-hidden="true">🡆</b>
                    </div>
                </button>

                <button 
                    type="button" 
                    className={`${styles.card} ${styles.cifras}`} 
                    onClick={() => handleCardClick(1)}
                    data-active={active === 1}
                    onPointerEnter={() => setPointed(1)}
                    onPointerLeave={() => setPointed(null)}
                    onFocus={() => setPointed(1)}
                    onBlur={() => setPointed(null)}
                >
                    <div>
                        <h2>Cifras</h2>
                        <p>Seis números, cuatro operaciones y un objetivo de tres cifras.</p>
                    </div>
                    <div className={styles.tiles} aria-hidden="true">
                        <span>75</span><span>8</span><span>6</span><span>25</span>
                    </div>
                    <div className={styles.go}>
                        Jugar el reto <b aria-hidden="true">🡆</b>
                    </div>
                </button>

                <button
                    type="button"
                    className={`${styles.card} ${styles.more}`}
                    aria-disabled="true"
                    data-active={active === 2}
                    onClick={() => handleCardClick(2)}
                >
                    <div>
                        <h2>Más retos</h2>
                        <p>Estadísticas, rachas y clasificación llegarán con las cuentas.</p>
                    </div>
                </button>
            </div>
            <div className={styles.nav}>
                <button type="button" className={styles.arrow} aria-label="Anterior" disabled={active === 0} onClick={() => goTo(active - 1)}>🢀</button>
                <div className={styles.dots}>
                    {CARDS.map((card, i) => (
                        <button key={card} type="button" aria-label={`Ir a ${card}`} aria-current={active === i} onClick={() => goTo(i)} />
                    ))}
                </div>            
                <button type="button" className={styles.arrow} aria-label="Siguiente" disabled={active === CARDS.length - 1} onClick={() => goTo(active + 1)}>🢂</button>
            </div>
            {grow}
        </main>
    )
}

export default HomePage