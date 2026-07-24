import { Link } from 'react-router';
import { IoCartOutline } from 'react-icons/io5';
import { FaRegHeart } from 'react-icons/fa';
import { FaArrowRightToBracket, FaUser } from 'react-icons/fa6';
import { openCart } from '@/entities/cart';
import { useCartDetails } from '@/entities/cart';
import { useWishlistDetails } from '@/entities/wishlist';
import { selectIsAuth } from '@/entities/session';
import { useGetUnreadNotificationsCountQuery } from '@/entities/notification';
import { useHaptics } from '@/shared/lib/hooks';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import style from './nav-actions.module.scss';

interface NavActionsProps {
    variant?: 'navbar' | 'mobile';
}

export const NavActions = ({ variant = 'navbar' }: NavActionsProps) => {
    const { soft } = useHaptics();
    const dispatch = useAppDispatch();
    const isAuth = useAppSelector(selectIsAuth);
    const { totalQuantity: cartTotals } = useCartDetails();
    const { totalQuantity: wishlistTotals } = useWishlistDetails();
    const { data: unreadCount } = useGetUnreadNotificationsCountQuery(undefined, { skip: !isAuth });

    const isCartLoaded = (cartTotals ?? 0) >= 1;
    const isWishlistLoaded = (wishlistTotals ?? 0) >= 1;
    const hasUnread = (unreadCount ?? 0) >= 1;

    const btnClass = `${style['nav-actions__btn']} ${variant === 'mobile' ? style['nav-actions__btn--mobile'] : ''}`;

    return (
        <div className={`${style['nav-actions']} ${variant === 'mobile' ? style['nav-actions--mobile'] : ''}`}>
            <Link to={'/wishlist'} aria-label="open wishlist" className={btnClass}>
                {isWishlistLoaded && <span className={style['nav-actions__btn__count']}>{wishlistTotals}</span>}
                <FaRegHeart />
            </Link>

            <button
                onClick={() => { dispatch(openCart()); soft() }}
                type="button"
                aria-label="open cart"
                className={btnClass}
            >
                {isCartLoaded && <span className={style['nav-actions__btn__count']}>{cartTotals}</span>}
                <IoCartOutline />
            </button>

            {isAuth ? (
                <Link to={'/user'} aria-label="open profile" className={btnClass}>
                    {hasUnread && (
                        <span className={style['nav-actions__btn__count']}>
                            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <FaUser />
                </Link>
            ) : (
                <Link to={'/login'} aria-label="sign in" className={btnClass}>
                    <FaArrowRightToBracket />
                </Link>
            )}
        </div>
    );
};
