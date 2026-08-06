import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaRegStar, FaCalendarDay } from 'react-icons/fa';

import { useHaptics } from '@/shared/lib/hooks';
import { formatDate } from '@/shared/lib';
import { ReviewProductPreview, UnreviewedPurchase } from '@/entities/review';

import style from './pending-review-card.module.scss';

interface PendingReviewCardProps {
    purchase: UnreviewedPurchase;
    product?: ReviewProductPreview;
    /** Called with the star the user clicked, so the modal can open pre-filled. */
    onRate: (rating: number) => void;
}

export const PendingReviewCard = memo(({ purchase, product, onRate }: PendingReviewCardProps) => {
    const { soft, light } = useHaptics();
    const [hovered, setHovered] = useState(0);

    const title = product?.title ?? `Product #${purchase.productId}`;

    const handleRate = (rating: number) => {
        light();
        onRate(rating);
    };

    return (
        <article className={style['pending-card']}>
            <Link
                href={`/product/${purchase.productId}`}
                className={style['pending-card__product']}
                onClick={soft}
            >
                {product?.thumbnail ? (
                    <Image
                        src={product.thumbnail}
                        alt=""
                        width={56}
                        height={56}
                        className={style['pending-card__thumb']}
                    />
                ) : (
                    <div className={style['pending-card__thumb--fallback']} aria-hidden="true" />
                )}
                <span className={style['pending-card__info']}>
                    <span className={style['pending-card__title']}>{title}</span>
                    <span className={style['pending-card__meta']}>
                        <FaCalendarDay className={style['pending-card__meta-icon']} />
                        Purchased{' '}
                        {formatDate(purchase.lastPurchasedAt, 'medium')}
                        {purchase.purchaseCount > 1 && (
                            <span className={style['pending-card__repeat']}>
                                bought {purchase.purchaseCount}&times;
                            </span>
                        )}
                    </span>
                </span>
            </Link>

            <div className={style['pending-card__cta']}>
                <span className={style['pending-card__prompt']}>How would you rate it?</span>
                <div
                    className={style['pending-card__stars']}
                    onMouseLeave={() => setHovered(0)}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={style['pending-card__star']}
                            onClick={() => handleRate(star)}
                            onMouseEnter={() => setHovered(star)}
                            onFocus={() => setHovered(star)}
                            onBlur={() => setHovered(0)}
                            aria-label={`Rate ${title} ${star} out of 5 stars`}
                        >
                            {star <= hovered ? (
                                <FaStar className={style['pending-card__star-icon--active']} />
                            ) : (
                                <FaRegStar className={style['pending-card__star-icon']} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </article>
    );
});

PendingReviewCard.displayName = 'PendingReviewCard';
