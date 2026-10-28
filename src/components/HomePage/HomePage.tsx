import { getChallengeNumber } from "../../domain/cifras/challenge";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect } from "react";
import { getActiveIndex } from "./carousel";
import styles from './HomePage.module.css'

import FloatingTiles from "../FloatingTiles/FloatingTiles";

const GAMES = ['Cifras', 'Letras'] as const
const CARDS = [...GAMES, 'Más retos']

const GROW_MS = 500

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function HomePage() {
    const navigate = useNavigate()

    const trackRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(0)
    const [growFrom, setGrowFrom] = useState<DOMRect | null>(null)
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
        if (GAMES[index] === 'Cifras') openCifras()
    }

    useEffect(() => {
        if (!growFrom) return
        const timer = setTimeout(() => navigate('/cifras'), GROW_MS)
        return () => clearTimeout(timer)
    }, [growFrom, navigate])

    function openCifras() {
        const card = trackRef.current?.children[0]
        if (prefersReducedMotion() || !card){
            navigate('/cifras')
            return
        }
        setGrowFrom(card.getBoundingClientRect())
    }

    return (
        <main className={styles.home}>
            <FloatingTiles game={pointed === null ? null : GAMES[pointed]} />
            <p className={styles.eyebrow}>Reto nº {getChallengeNumber(new Date())} · desliza para elegir</p>

            <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
                <button 
                    type="button" 
                    className={`${styles.card} ${styles.cifras}`} 
                    onClick={() => handleCardClick(0)}
                    data-active={active === 0}
                    onPointerEnter={() => setPointed(0)}
                    onPointerLeave={() => setPointed(null)}
                    onFocus={() => setPointed(0)}
                    onBlur={() => setPointed(null)}
                >
                    <div>
                        <span className={styles.kicker}>Juego 1</span>
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
                    className={`${styles.card} ${styles.letras}`} 
                    aria-disabled="true"
                    data-active={active === 1}
                    onClick={() => handleCardClick(1)}
                    onPointerEnter={() => setPointed(1)}
                    onPointerLeave={() => setPointed(null)}
                    onFocus={() => setPointed(1)}
                    onBlur={() => setPointed(null)}
                >
                    <div>
                        <span className={styles.kicker}>Juego 2</span>
                        <h2>Letras</h2>
                        <p>Nueve letras para la palabra más larga.</p>
                    </div>
                    <div className={styles.tiles} aria-hidden="true">
                        <span>L</span><span>E</span><span>T</span><span>A</span>
                    </div>
                    <div className={styles.go}>
                        <span className={styles.soon}>Próximamente</span>
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
            {growFrom && (
                <div
                    className={styles.grow}
                    data-testid="grow"
                    aria-hidden="true"
                    style={{
                        top: growFrom.top,
                        left: growFrom.left,
                        width: growFrom.width,
                        height: growFrom.height,
                        animationDuration: `${GROW_MS}ms`,
                    }}
                />
            )}
        </main>
    )
}

export default HomePage