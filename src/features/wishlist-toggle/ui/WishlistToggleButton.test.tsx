import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { REHYDRATE } from 'redux-persist';
import { renderWithProviders, createTestStore, AppStore } from '@test/renderWithProviders';
import { seedProductArray } from '@test/seedApi';
import { makeProduct } from '@test/fixtures';
import { toogleFavorite } from '@/entities/wishlist';
import { WishlistToggleButton } from './WishlistToggleButton';

// renderWithProviders' store never calls persistStore(), so redux-persist's
// per-slice `_persist.rehydrated` flag stays unset forever unless something
// dispatches the same REHYDRATE action persistStore() would. Doing that for
// all four persisted slices (auth/cart/wishlist/checkout) is the real
// mechanism useIsRehydrated reads, not a stand-in for it.
const markRehydrated = (store: AppStore) => {
  (['auth', 'cart', 'wishlist', 'checkout'] as const).forEach((key) => {
    store.dispatch({ type: REHYDRATE, key, payload: undefined });
  });
};

const PRODUCT_ID = 5;

describe('WishlistToggleButton', () => {
  it('shows the outline heart for an unauthenticated, empty wishlist', async () => {
    const store = createTestStore();
    await seedProductArray(store, [PRODUCT_ID], [makeProduct({ id: PRODUCT_ID })]);
    markRehydrated(store);
    renderWithProviders(<WishlistToggleButton productId={PRODUCT_ID} />, { store });

    const button = screen.getByRole('button', { name: 'Add to wishlist' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('stays unfilled before rehydration even if the product is already favorited', async () => {
    // This is the SSR-hydration-mismatch guard WishlistToggleButton documents:
    // persisted state is empty on the server and until redux-persist
    // restores it, so the filled state must stay gated on isRehydrated
    // regardless of what's actually in the store.
    const store = createTestStore();
    store.dispatch(toogleFavorite(PRODUCT_ID));
    await seedProductArray(store, [PRODUCT_ID], [makeProduct({ id: PRODUCT_ID })]);
    // Deliberately not calling markRehydrated(store) here.
    renderWithProviders(<WishlistToggleButton productId={PRODUCT_ID} />, { store });

    expect(screen.getByRole('button', { name: 'Add to wishlist' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reflects an already-favorited product once rehydrated', async () => {
    const store = createTestStore();
    store.dispatch(toogleFavorite(PRODUCT_ID));
    await seedProductArray(store, [PRODUCT_ID], [makeProduct({ id: PRODUCT_ID })]);
    markRehydrated(store);
    renderWithProviders(<WishlistToggleButton productId={PRODUCT_ID} />, { store });

    const button = screen.getByRole('button', { name: 'Remove from wishlist' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles the guest wishlist in Redux and updates its own label on click', async () => {
    const store = createTestStore();
    await seedProductArray(store, [PRODUCT_ID], [makeProduct({ id: PRODUCT_ID })]);
    markRehydrated(store);
    const { user } = renderWithProviders(<WishlistToggleButton productId={PRODUCT_ID} />, {
      store,
    });

    await user.click(screen.getByRole('button', { name: 'Add to wishlist' }));

    expect(store.getState().wishlist.favoriteItems[PRODUCT_ID]).toBe(true);
    expect(screen.getByRole('button', { name: 'Remove from wishlist' })).toBeInTheDocument();
  });

  it('does not let its click reach an enclosing link', async () => {
    const store = createTestStore();
    await seedProductArray(store, [PRODUCT_ID], [makeProduct({ id: PRODUCT_ID })]);
    markRehydrated(store);
    const onParentClick = vi.fn();
    const { user } = renderWithProviders(
      <a href="#" onClick={onParentClick}>
        <WishlistToggleButton productId={PRODUCT_ID} />
      </a>,
      { store },
    );

    await user.click(screen.getByRole('button', { name: 'Add to wishlist' }));

    expect(onParentClick).not.toHaveBeenCalled();
  });
});
