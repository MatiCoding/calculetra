import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const repo = 'https://github.com/MatiCoding/calculetra'

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    title: 'Calculetra',
    description: 'Documentation of Calculetra, a daily numbers and letters puzzle.',
    lang: 'en-US',

    // GitHub Pages serves the site from https://maticoding.github.io/calculetra/
    base: '/calculetra/',

    themeConfig: {
      nav: [
        { text: 'Play', link: 'https://calculetra.vercel.app' },
        { text: 'Contributing', link: `${repo}/blob/main/CONTRIBUTING.md` },
      ],

      // Add new pages here, in the same order as in docs/index.md
      sidebar: [
        {
          text: 'Rules',
          items: [{ text: 'Cifras', link: '/rules/cifras' }],
        },
        {
          text: 'Architecture',
          items: [{ text: 'Architecture', link: '/architecture' }],
        },
        {
          text: 'Decisions',
          items: [
            { text: 'About ADRs', link: '/decisions/README' },
            { text: '0001. Use Supabase as the backend', link: '/decisions/0001-backend-supabase' },
          ],
        },
      ],

      socialLinks: [{ icon: 'github', link: repo }],

      search: {
        provider: 'local',
      },
    },

    vite: {
      // Mermaid uses a CommonJS package (fastdom) that the dev server
      // cannot load as it is, so Vite pre-bundles Mermaid.
      optimizeDeps: {
        include: ['mermaid'],
      },
    },
  }),
)
