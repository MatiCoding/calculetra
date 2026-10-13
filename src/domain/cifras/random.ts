
export function hashString(text: string): number {

    let hash = 2166136261            
    for (let i = 0; i < text.length; i++) {
        hash = hash ^ text.charCodeAt(i)    // hash XOR code of character.
        hash = Math.imul(hash, 16777619)
    }

    return hash >>> 0    // return as unsigned 32-bit integer    
}

export function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}