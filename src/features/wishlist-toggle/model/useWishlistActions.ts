import { useAppDispatch, useAppSelector } from '@/shared/model';
import { useCallback } from 'react';
import { selectIsAuth } from '@/entities/session';
import {
  useGetWishlistQuery,
  useToggleWishlistMutation,
  toogleFavorite,
  addFavorite,
  WishlistState,
} from '@/entities/wishlist';
import { showToast } from '@/shared/ui';

interface useWishlistActionsProps {
  onWishlist(id: number, price?: number): void;
  isUpdating: boolean;
}

export const useWishlistActions = (): useWishlistActionsProps => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);
  const guestFavoriteItems = useAppSelector(
    (state: { wishlist: WishlistState }) => state.wishlist.favoriteItems,
  );

  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuth });

  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();

  const onWishlist = useCallback(
    (id: number, price?: number) => {
      const isInWishlist = isAuth ? !!wishlistData?.[id] : !!guestFavoriteItems[id];

      if (isAuth) {
        toggleWishlist({
          productId: id,
          isInWishlist,
          priceAtAdd: isInWishlist ? undefined : price,
        });
      } else {
        dispatch(toogleFavorite(id));
      }

      if (isInWishlist) {
        const restoreItem = () => {
          if (isAuth) {
            toggleWishlist({ productId: id, isInWishlist: false, priceAtAdd: price });
          } else {
            dispatch(addFavorite(id));
          }
          showToast('added', 'Returned to wishlist', { key: 'wishlist-undo' });
        };

        showToast('removed', 'Removed from wishlist', {
          key: 'wishlist',
          showTimer: true,
          action: { label: 'Undo', emphasis: 'ghost', onClick: restoreItem },
        });
      } else {
        showToast('added', 'Added to wishlist', {
          key: 'wishlist',
          action: { label: 'View', to: '/wishlist' },
        });
      }
    },
    [isAuth, toggleWishlist, dispatch, wishlistData, guestFavoriteItems],
  );

  return { onWishlist, isUpdating: isToggling };
};
