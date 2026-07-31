// Deliberately not force-imported into app/store.ts like
// product/review/order: these endpoints are only ever needed by the lazy
// admin-dashboard-page, which registers them itself by importing the hook
// below. Keeping this out of the store's eager imports keeps admin code out
// of every customer's initial bundle.
export * from './api/adminStatsApi';
export * from './api/adminOrdersApi';
export * from './api/adminProductsApi';
export * from './api/adminCustomersApi';
export * from './api/adminReviewsApi';
export * from './api/adminMethodsApi';
export * from './model/types';
