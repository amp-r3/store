// Single tag namespace for the app-wide RTK Query cache. Tag names live in
// `shared` because `createApi` requires all tagTypes up front, and every slice
// injects into one base API. Entities reference them via the string literals
// they already use — no upward import, no entity→entity import.
export const API_TAGS = [
    'Product',
    'Category',
    'PurchaseHistory',
    'Review',
    'Cart',
    'Wishlist',
    'Order',
] as const;

export type ApiTag = (typeof API_TAGS)[number];
