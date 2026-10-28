// Position and width of a card inside the track, in pixels.
export type CardBox = {left: number, width: number}

// The active card is the one whose center is closest to the center of the part of the track that can be seen.
export function getActiveIndex(scrollLeft: number, trackWidth: number, cards: CardBox[]): number {
    const middle = scrollLeft + trackWidth/2
    let best = 0
    cards.forEach((card, i) => {
        const distance = Math.abs(card.left + card.width / 2 - middle)
        const bestDistance = Math.abs(cards[best].left + cards[best].width / 2 - middle)
        if (distance < bestDistance) best = i
    })
    return best
}