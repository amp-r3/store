// RSC-safe subset of this slice's public API — see entities/product/server.ts
// for why this exists (main index.ts's export * pulls in client-only
// UI/hooks and breaks Server Components that import it).
export { catalogParamsSchema } from './model/catalogParamsSchema';
