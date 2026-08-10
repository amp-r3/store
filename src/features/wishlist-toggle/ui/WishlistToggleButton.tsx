import { FC } from 'react';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { useWishlistActions } from '../model/useWishlistActions';
import { useWishlistDetails } from '@/entities/wishlist';
import { useIsRehydrated } from '@/shared/model';
import style from './wishlist-toggle-button.module.scss';

interface WishlistToggleButtonProps {
  productId: number;
  price?: number;
}

export const WishlistToggleButton: FC<WishlistToggleButtonProps> = ({ productId, price }) => {
  const { wishlistItems } = useWishlistDetails();
  const isRehydrated = useIsRehydrated();
  // Persisted wishlist state is empty on the server and until redux-persist
  // restores it — gate the filled-heart state on rehydration so SSR/ISR
  // markup (server always renders the outline) can't mismatch the client's
  // first render.
  const isFavorite = isRehydrated && wishlistItems.some((item) => item?.id === productId);
  const { onWishlist } = useWishlistActions();

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click
    onWishlist(productId, price);
  };

  return (
    <button className={style['wishlist-btn']} onClick={handleAddToWishlist}>
      {isFavorite ? (
        <FaHeart className={style['wishlist-btn__icon']} />
      ) : (
        <FaRegHeart className={style['wishlist-btn__icon']} />
      )}
    </button>
  );
};
