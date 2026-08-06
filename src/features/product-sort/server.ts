// RSC-safe subset of this slice's public API — see entities/product/server.ts
// for why this exists (main index.ts's export * pulls in SortControl, which
// uses useMediaQuery and breaks Server Components that import it).
export { sortingOptions } from './config/sortingOptions';
export type { SortingOption, SortField, SortOrder } from './config/sortingOptions';
