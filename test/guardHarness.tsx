import { AppStore as TestStore } from '@/app/store';

// The four route guards (ProtectedRoute, PublicRoute, CheckoutGuard,
// AdminRoute) all gate on useIsRehydrated() (src/shared/model), which is
// true only once every independently-persisted slice (auth, cart, wishlist,
// checkout) reports `_persist.rehydrated`. renderWithProviders deliberately
// never runs persistStore() (see its own header comment), so under test
// useIsRehydrated() is permanently false and no guard can ever reach its
// redirect/children branch — every render sees only the "not decided yet"
// fallback.
//
// Rather than mocking the @/shared/model barrel (which would also have to
// preserve useAppSelector/useAppDispatch, and vi.mock factories can't be
// shared across files anyway — Vite's static hoisting requires the vi.mock
// call to live in the consuming test file), dispatch the same REHYDRATE
// action redux-persist's own persistReducer listens for. Each slice's
// persistReducer is keyed by its slice name (`authPersistConfig.key ===
// 'auth'`, etc. — verified in authSlice.ts/cartSlice.ts/wishlistSlice.ts/
// app/store.ts), so this sets `_persist.rehydrated = true` on all four
// without needing a live localStorage or persistStore() at all.
const PERSIST_KEYS = ['auth', 'cart', 'wishlist', 'checkout'] as const;

export const rehydrateAll = (store: TestStore) => {
  PERSIST_KEYS.forEach((key) => {
    store.dispatch({ type: 'persist/REHYDRATE', key, payload: undefined });
  });
};
