import { WishlistData } from '../model/wishlistSelectors';

// Authenticated + loaded: server ids win over the guest/local list. Every
// key is kept regardless of its boolean value — wishlistApi's optimistic
// update deletes a key on removal rather than setting it false, so this
// only holds as long as that invariant does; a future write path that sets
// `false` instead of deleting would resurrect a removed favorite here.
// Anything else (guest, or authenticated with the server query still
// loading) falls back to the local Redux wishlist — which means right
// after login, before `getWishlist` resolves, this still renders the
// guest list, not an empty one.
export const unifyWishlist = (
  isAuth: boolean,
  serverWishlist: Record<number, boolean> | undefined,
  localWishlistItems: WishlistData[],
): WishlistData[] => {
  if (isAuth && serverWishlist) {
    return (Object.entries(serverWishlist) as [string, boolean][]).map(([id]) => ({
      id: Number(id),
    }));
  }
  return localWishlistItems;
};
