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
 * resolves at all, which is why it had to go for SSR to produce any HTML). */
export const useIsRehydrated = () =>
  useAppSelector((state) => Boolean(
    state.auth._persist?.rehydrated &&
    state.cart._persist?.rehydrated &&
    state.wishlist._persist?.rehydrated &&
    state.checkout._persist?.rehydrated
  ));
