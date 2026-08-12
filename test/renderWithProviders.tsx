import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions as RTLRenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/app/store';

export type { AppStore };
import { restoreCart, CartData } from '@/entities/cart';

// Deliberately does not reuse AppProviders (src/app/providers/AppProviders.tsx):
// it also renders AppEffects (useAuthSync/useNotificationsSync -> live
// Supabase) and starts persistStore(), both gated on `typeof window !==
// 'undefined'`, which is true under jsdom. This wraps makeStore() (the same
// factory production uses) in a plain Provider instead.
//
// Redux-only slices are seeded by dispatching real action creators, not via
// configureStore's `preloadedState` — passing a partial state object there
// hits a known RTK generic-inference conflict ("two different types with
// this name exist, but they are unrelated") once a reducer map mixes RTK
// Query's CombinedState with plain slices.

/**
 * Builds a store without rendering — use when a test needs to seed the RTK
 * Query cache (test/seedApi.ts) before mount. `upsertQueryData` is async
 * (it returns a promise), so it must be awaited BEFORE the store is handed
 * to `renderWithProviders`: a component's useXQuery fires its real queryFn
 * (hitting the unmocked Supabase client, and reading `stock`/etc as their
 * loading-state default) the moment it subscribes with no cached data yet.
 *
 *   const store = createTestStore();
 *   await seedSizes(store, product.id, [size]);
 *   renderWithProviders(<CartItem product={product} />, { store });
 */
export const createTestStore = makeStore;

interface RenderWithProvidersOptions extends Omit<RTLRenderOptions, 'wrapper'> {
  /** Seeds cart.items (guest/local cart) before first render. */
  cartItems?: Record<number, CartData>;
  store?: AppStore;
}

export const renderWithProviders = (
  ui: ReactElement,
  { cartItems, store = createTestStore(), ...renderOptions }: RenderWithProvidersOptions = {},
) => {
  if (cartItems) {
    store.dispatch(restoreCart(cartItems));
  }

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
