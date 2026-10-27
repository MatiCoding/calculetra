import { getChallengeNumber } from "../../domain/cifras/challenge";
import { useNavigate } from "react-router";
import { useRef, useState } from "react";
import { getActiveIndex } from "./carousel";
import styles from './HomePage.module.css'

function HomePage() {
    const navigate = useNavigate()

    const trackRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(0)

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

    return (
        <main className={styles.home}>
            <p className={styles.eyebrow}>Reto nº {getChallengeNumber(new Date())} · desliza para elegir</p>

            <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
                <button 
                    type="button" 
                    className={`${styles.card} ${styles.cifras}`} 
                    onClick={() => navigate('/cifras')}
                    data-active={active === 0}
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
            </div>
        </main>
    )
}

export default HomePage