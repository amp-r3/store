// Postgrest-via-Supabase's "no rows past the end of this range" signal — a
// 416 (raw offset past the end) or the equivalent PGRST103 code depending on
// how the request is proxied. Shared by usePaginationBounds (which resets
// the page) and useProductCatalog (which renders it as a loading state
// rather than a real error) so the two call sites can't drift apart.
export const isRangeError = (error: unknown): boolean =>
  !!error &&
  typeof error === 'object' &&
  'status' in error &&
  (error.status === 'PGRST103' || error.status === 416);
