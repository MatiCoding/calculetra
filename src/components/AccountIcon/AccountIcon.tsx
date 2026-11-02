import type { ReactNode } from 'react'

export type AccountIconName = 'summary' | 'password' | 'email' | 'delete'

// The inside of each 24×24 icon. They are drawn with lines, so they take the color of the text (currentColor) like the rest of the tab.
const SHAPES: Record<AccountIconName, ReactNode> = {
    // Three bars, like a chart.
    summary: (
        <>
            <rect x="3" y="12" width="4.5" height="8" rx="1.2" />
            <rect x="9.75" y="7" width="4.5" height="13" rx="1.2" />
            <rect x="16.5" y="3.5" width="4.5" height="16.5" rx="1.2" />
        </>
    ),
    // A padlock.
    password: (
        <>
            <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
        </>
    ),
    // An envelope.
    email: (
        <>
            <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
            <path d="m4 7.5 8 6 8-6" />
        </>
    ),
    // A bin.
    delete: <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />,
}

function AccountIcon({ name }: { name: AccountIconName }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {SHAPES[name]}
        </svg>
    )
}

export default AccountIcon
