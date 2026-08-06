// Vite-flavored `import.meta.env.VITE_*` access is still used in
// shared/api/supabase.ts and shared/config/site.ts — migrating those to
// `process.env.NEXT_PUBLIC_*` is a Next.js migration stage-2 task. Until
// then, this replaces the `vite/client` triple-slash reference (no longer
// resolvable — the `vite` package is gone) with the same shape by hand.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.sass' {
  const classes: { [key: string]: string }
  export default classes
}
