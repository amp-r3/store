import { useEffect, useState } from 'react';
import { useAppSelector } from './redux';

/** True once every independently-persisted slice (auth, cart, wishlist,
 * checkout) has restored from storage. Each wraps itself in its own
 * persistReducer (see entities/session|cart|wishlist, app/store.ts for
 * checkout) rather than one root-level persistReducer, so there's no single
 * `_persist` flag to read — this checks all four, which in practice resolve
 * together off the same localStorage-backed engine.
 *
 * Needed now that AppProviders no longer wraps the tree in <PersistGate>
 * (that blocked all rendering — including on the server, where it never
 * resolves at all, which is why it had to go for SSR to produce any HTML).
 *
 * The `hasMounted` gate is load-bearing, not decorative: redux-persist's
 * rehydration is a localStorage read wrapped in a promise, which can
 * resolve within a microtask — often before React finishes hydrating. Read
 * the Redux flag directly and the client's very first render can already
 * see `true` while the server (no localStorage) always rendered `false`,
 * which is a hydration mismatch. Gating on a state flip that only ever
 * happens inside a `useEffect` guarantees the first client render matches
 * the server regardless of how fast rehydration wins that race. */
export const useIsRehydrated = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const reduxRehydrated = useAppSelector((state) =>
    Boolean(
      state.auth._persist?.rehydrated &&
      state.cart._persist?.rehydrated &&
      state.wishlist._persist?.rehydrated &&
      state.checkout._persist?.rehydrated,
    ),
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted && reduxRehydrated;
};
