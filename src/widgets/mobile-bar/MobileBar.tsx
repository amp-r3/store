import { useEffect, useState, useRef } from 'react';
import { NavLink, useMatch, useNavigate } from 'react-router';
import { skipToken } from '@reduxjs/toolkit/query';
import { IoSearchOutline, IoArrowBackOutline, IoHomeOutline, IoCartOutline } from 'react-icons/io5';
import { FaRegHeart } from 'react-icons/fa';
import { FaArrowRightToBracket, FaUser } from 'react-icons/fa6';
import style from './mobile-bar.module.scss';
import { useSearch, SearchForm } from "@/features/product-search";
import { openCart, useCartDetails, CartProduct } from "@/entities/cart";
import { useWishlistDetails } from "@/entities/wishlist";
import { selectIsAuth } from "@/entities/session";
import { useGetUnreadNotificationsCountQuery } from "@/entities/notification";
import { useProduct, useGetSizesQuery, useSelectedSize, getPurchaseState } from "@/entities/product";
import { useCartActions, AddToCartButton, QuickBuyButton } from "@/features/cart-actions";
import { addToCheckout, clearCheckout } from "@/features/checkout-process";
import { useHideOnScroll, useHaptics, useOnScreen, useMediaQuery } from "@/shared/lib/hooks";
import { formatPrice, scrollToElement, REQUEST_SIZE_EVENT } from "@/shared/lib";
import { useAppDispatch, useAppSelector } from "@/shared/model";

type DockLayer = 'nav' | 'search' | 'purchase';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${style.navbar__tab} ${isActive ? style['navbar__tab--active'] : ''}`;

export const MobileBar = () => {
    const { handleSearch, inputValue, handleClear, submitSearch } = useSearch();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNavPinned, setIsNavPinned] = useState(false);
    const { soft } = useHaptics();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isAuth = useAppSelector(selectIsAuth);
    const { totalQuantity: cartTotals, cartItems } = useCartDetails();
    const { totalQuantity: wishlistTotals } = useWishlistDetails();
    const { data: unreadCount } = useGetUnreadNotificationsCountQuery(undefined, { skip: !isAuth });

    const productMatch = useMatch('/product/:id');
    const productId = productMatch?.params.id;
    const { product } = useProduct(productId);
    const { data: sizes } = useGetSizesQuery(productId ? +productId : skipToken);
    const { selectedSizeId } = useSelectedSize(sizes);
    const { onIncrease, onDecrease } = useCartActions();

    const prevProductRef = useRef(product);
    if (product) prevProductRef.current = product;
    const displayProduct = product || prevProductRef.current;

    const prevSizesRef = useRef(sizes);
    if (sizes) prevSizesRef.current = sizes;
    const displaySizes = sizes || prevSizesRef.current;

    const isPurchaseBoxOnScreen = useOnScreen(
        'product-purchase-box',
        { rootMargin: '0px 0px -160px 0px' },
        [productId, displayProduct],
    );

    useEffect(() => {
        setIsNavPinned(false);
    }, [productId]);

    useEffect(() => {
        if (isPurchaseBoxOnScreen) setIsNavPinned(false);
    }, [isPurchaseBoxOnScreen]);

    const activeLayer: DockLayer = isSearchOpen
        ? 'search'
        : (productId && !isPurchaseBoxOnScreen && !isNavPinned ? 'purchase' : 'nav');

    const isCartLoaded = (cartTotals ?? 0) >= 1;
    const isWishlistLoaded = (wishlistTotals ?? 0) >= 1;
    const hasUnread = (unreadCount ?? 0) >= 1;

    const closeSearch = () => setIsSearchOpen(false);
    const closePurchase = () => setIsNavPinned(true);

    const handleSubmit = () => {
        submitSearch();
        closeSearch();
    };

    useEffect(() => {
        if (activeLayer === 'nav') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (activeLayer === 'search') closeSearch();
            else closePurchase();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeLayer]);

    const hasSizes = !!(displaySizes && displaySizes.length > 0);
    const itemInCart = displayProduct
        ? cartItems.find(item => item?.productId === displayProduct.id && item?.sizeId === selectedSizeId)
        : undefined;
    const quantity = itemInCart?.quantity || 0;
    const isNarrowPurchaseBar = useMediaQuery('(max-width: 399px)');
    const showQuickBuy = quantity === 0 || !isNarrowPurchaseBar;

    const {
        isSizeSelected,
        currentInStock,
        isMaxReached,
    } = getPurchaseState({ quantity, sizes: displaySizes, selectedSizeId, hasSizes });

    const requestSize = () => {
        scrollToElement('product-sizes', 'center');
        window.dispatchEvent(new CustomEvent(REQUEST_SIZE_EVENT));
    };

    const handleIncrement = () => {
        if (!displayProduct) return;
        const stock = displaySizes?.find(s => s.id === selectedSizeId)?.stock;
        onIncrease(selectedSizeId as number, displayProduct.id, stock);
    };

    const handleAddToCart = () => {
        if (!isSizeSelected) {
            requestSize();
            return;
        }
        handleIncrement();
    };

    const handleQuickBuy = () => {
        if (!displayProduct) return;
        if (!isSizeSelected) {
            requestSize();
            return;
        }
        const cartProduct: CartProduct[] = [{ sizeId: selectedSizeId as number, productId: displayProduct.id, quantity: 1 }];
        dispatch(clearCheckout());
        dispatch(addToCheckout(cartProduct));
        navigate('/checkout');
    };

    const barRef = useHideOnScroll<HTMLElement>(style['navbar--hidden'], activeLayer !== 'nav');
    const hasDiscount = !!displayProduct && displayProduct.discountPercentage > 0;

    return (
        <>
            <nav ref={barRef} className={style.navbar}>
                <div className={style.navbar__cluster} inert={activeLayer !== 'nav' || undefined}>
                    <div className={style.navbar__pill}>
                        <NavLink to="/" end aria-label="Home" className={navLinkClass} onClick={() => soft()}>
                            <IoHomeOutline />
                        </NavLink>
                        <NavLink to="/wishlist" aria-label="Open wishlist" className={navLinkClass} onClick={() => soft()}>
                            {isWishlistLoaded && <span className={style.navbar__badge}>{wishlistTotals}</span>}
                            <FaRegHeart />
                        </NavLink>
                    </div>

                    <button
                        type="button"
                        className={style.navbar__fab}
                        aria-label="Open search"
                        aria-expanded={isSearchOpen}
                        onClick={() => { setIsSearchOpen(true); soft(); }}
                    >
                        <IoSearchOutline />
                    </button>

                    <div className={style.navbar__pill}>
                        <button
                            type="button"
                            className={style.navbar__tab}
                            aria-label="Open cart"
                            onClick={() => { dispatch(openCart()); soft(); }}
                        >
                            {isCartLoaded && <span className={style.navbar__badge}>{cartTotals}</span>}
                            <IoCartOutline />
                        </button>
                        {isAuth ? (
                            <NavLink to="/user" aria-label="Open profile" className={navLinkClass} onClick={() => soft()}>
                                {hasUnread && (
                                    <span className={style.navbar__badge}>
                                        {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                                <FaUser />
                            </NavLink>
                        ) : (
                            <NavLink to="/login" aria-label="Sign in" className={navLinkClass} onClick={() => soft()}>
                                <FaArrowRightToBracket />
                            </NavLink>
                        )}
                    </div>
                </div>

                <div className={style.navbar__search} inert={activeLayer !== 'search' || undefined}>
                    <button
                        type="button"
                        className={style.navbar__back}
                        aria-label="Close search"
                        onClick={closeSearch}
                    >
                        <IoArrowBackOutline />
                    </button>
                    <SearchForm
                        inputValue={inputValue}
                        handleSearch={handleSearch}
                        handleClear={handleClear}
                        onSubmit={handleSubmit}
                        autoFocus={isSearchOpen}
                    />
                </div>

                <div className={style.navbar__purchase} inert={activeLayer !== 'purchase' || undefined}>
                    <button
                        type="button"
                        className={style.navbar__back}
                        aria-label="Back to navigation"
                        onClick={closePurchase}
                    >
                        <IoArrowBackOutline />
                    </button>
                    {displayProduct && (
                        <>
                            <div className={style.navbar__price}>
                                <span className={style['navbar__price-current']}>
                                    {formatPrice(hasDiscount ? displayProduct.price : displayProduct.basePrice)}
                                </span>
                                {hasDiscount && (
                                    <span className={style['navbar__price-original']}>
                                        {formatPrice(displayProduct.basePrice)}
                                    </span>
                                )}
                            </div>
                            <AddToCartButton
                                quantity={quantity}
                                onAddToCart={handleAddToCart}
                                onIncrement={handleIncrement}
                                onDecrement={() => onDecrease(selectedSizeId as number, displayProduct.id)}
                                inStock={currentInStock}
                                isMaxReached={isMaxReached}
                                buttonText={isSizeSelected ? 'Add to Cart' : 'Select Size'}
                                outOfStockText="Out of Stock"
                                iconOnly
                            />
                            <div
                                className={`${style['navbar__buy-wrapper']} ${!showQuickBuy ? style['navbar__buy-wrapper--hidden'] : ''}`}
                                inert={!showQuickBuy || undefined}
                            >
                                <QuickBuyButton
                                    onClick={handleQuickBuy}
                                    disabled={!currentInStock}
                                    iconOnly
                                />
                            </div>
                        </>
                    )}
                </div>
            </nav>
            {
                isSearchOpen &&
                <div className={style.navbar__backdrop} onClick={closeSearch}></div>
            }
        </>
    )
}
