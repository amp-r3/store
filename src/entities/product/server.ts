// RSC-safe subset of this slice's public API: pure Supabase query functions
// and their types only — none of the client-only UI/hooks behind the main
// index.ts (export * there pulls in useSelectedSize -> useMediaQuery, which
// uses useSyncExternalStore and breaks the server/client boundary). Server
// Components (app/**/page.tsx) import from here instead of '@/entities/product'.
export * from './api/queries';
export type { Product, ProductSize } from './model/types';
export { sortingOptions } from './config/sortingOptions';
export type { SortingOption, SortField, SortOrder } from './config/sortingOptions';
