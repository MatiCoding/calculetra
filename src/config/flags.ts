// Vite replaces `import.meta.env.*` with its literal value at build time,
// so this comparison becomes `true` or `false` and the unused branch in
// main.tsx is removed from the production bundle.
export const IS_UNDER_CONSTRUCTION = import.meta.env.VITE_UNDER_CONSTRUCTION === 'true';