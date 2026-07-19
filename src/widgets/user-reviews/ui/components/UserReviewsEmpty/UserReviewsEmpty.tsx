import { Link } from 'react-router';
import { FaRegStar, FaRegCheckCircle } from 'react-icons/fa';

import style from './user-reviews-empty.module.scss';

interface UserReviewsEmptyProps {
    variant: 'written' | 'pending';
    /** Steers the CTA: nudge toward pending items when the user has some. */
    hasPending: boolean;
}

export const UserReviewsEmpty = ({ variant, hasPending }: UserReviewsEmptyProps) => {
    if (variant === 'pending') {
        return (
            <div className={style['reviews-empty']}>
                <span className={style['reviews-empty__icon']} aria-hidden="true">
                    <FaRegCheckCircle />
                </span>
                <h3 className={style['reviews-empty__title']}>All caught up</h3>
                <p className={style['reviews-empty__text']}>
                    You&apos;ve reviewed everything you bought. Nothing is waiting on you.
                </p>
                <Link to="/catalog" className={style['reviews-empty__cta']}>
                    Browse catalog
                </Link>
            </div>
        );
    }

    return (
        <div className={style['reviews-empty']}>
            <span className={style['reviews-empty__icon']} aria-hidden="true">
                <FaRegStar />
            </span>
            <h3 className={style['reviews-empty__title']}>No reviews yet</h3>
            <p className={style['reviews-empty__text']}>
                {hasPending
                    ? 'You have purchases waiting for a rating — the Pending tab has them all.'
                    : 'Once you buy something, you can share what you think about it here.'}
            </p>
            <Link
                to={hasPending ? '/user/reviews?tab=pending' : '/catalog'}
                className={style['reviews-empty__cta']}
            >
                {hasPending ? 'See pending items' : 'Browse catalog'}
            </Link>
        </div>
    );
};
