import Link from 'next/link';
import { IoCartOutline } from 'react-icons/io5';
import { FaRegHeart } from 'react-icons/fa';
import { FaArrowRightToBracket, FaUser } from 'react-icons/fa6';
import { openCart } from '@/entities/cart';
import { useCartDetails } from '@/entities/cart';
import { useWishlistDetails } from '@/entities/wishlist';
import { selectIsAuth } from '@/entities/session';
import { useGetUnreadNotificationsCountQuery } from '@/entities/notification';
import { useHaptics } from '@/shared/lib/hooks';
import { useAppDispatch, useAppSelector, useIsRehydrated } from '@/shared/model';
import style from './nav-actions.module.scss';

export const NavActions = () => {
  const { soft } = useHaptics();
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);
  const isRehydrated = useIsRehydrated();
  const { totalQuantity: cartTotals } = useCartDetails();
  const { totalQuantity: wishlistTotals } = useWishlistDetails();
  const { data: unreadCount } = useGetUnreadNotificationsCountQuery(undefined, { skip: !isAuth });

  // Guest cart/wishlist counts come from persisted state, empty until
  // redux-persist restores it (always the case on the server) — gate the
  // badge on that explicitly rather than relying on the count incidentally
  // being 0 pre-rehydration.
  const isCartLoaded = isRehydrated && (cartTotals ?? 0) >= 1;
  const isWishlistLoaded = isRehydrated && (wishlistTotals ?? 0) >= 1;
  const hasUnread = (unreadCount ?? 0) >= 1;
  // Same reasoning: auth.user is persisted too, so isAuth can already be
  // true on the client's first render (SSR always renders false, no
  // session available there) — gate the profile-vs-login branch on it or
  // the link's href/label/icon mismatch between server and client.
  const isAuthReady = isRehydrated && isAuth;

  const btnClass = style['nav-actions__btn'];

  return (
    <div className={style['nav-actions']}>
      <Link
        href={'/wishlist'}
        aria-label={isWishlistLoaded ? `Open wishlist, ${wishlistTotals} items` : 'Open wishlist'}
        className={btnClass}
        data-testid="wishlist-open"
      >
        {isWishlistLoaded && (
          <span className={style['nav-actions__btn__count']} aria-hidden="true">
            {wishlistTotals}
          </span>
        )}
        <FaRegHeart />
      </Link>

      <button
        onClick={() => {
          dispatch(openCart());
          soft();
        }}
        type="button"
        aria-label={isCartLoaded ? `Open cart, ${cartTotals} items` : 'Open cart'}
        data-testid="cart-open"
        className={btnClass}
      >
        {isCartLoaded && (
          <span className={style['nav-actions__btn__count']} aria-hidden="true">
            {cartTotals}
          </span>
        )}
        <IoCartOutline />
      </button>

      {isAuthReady ? (
        <Link
          href={'/user'}
          aria-label={hasUnread ? `Open profile, ${unreadCount} unread` : 'Open profile'}
          className={btnClass}
          data-testid="profile-open"
        >
          {hasUnread && (
            <span className={style['nav-actions__btn__count']} aria-hidden="true">
              {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
            </span>
          )}
          <FaUser />
        </Link>
      ) : (
        <Link href={'/login'} aria-label="Sign in" className={btnClass} data-testid="sign-in-open">
          <FaArrowRightToBracket />
        </Link>
      )}
    </div>
  );
};
