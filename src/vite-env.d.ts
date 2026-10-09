/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_UNDER_CONSTRUCTION?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}