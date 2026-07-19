import { UserReviews } from '@/widgets/user-reviews';

import style from './user-reviews-page.module.scss';

export const UserReviewsPage = () => {
    return (
        <>
            <header className={style['user-reviews-page__content-header']}>
                <h1 className={style['user-reviews-page__title']}>My Reviews</h1>
                <p className={style['user-reviews-page__subtitle']}>
                    Everything you&apos;ve rated, plus what&apos;s still waiting for your verdict.
                </p>
            </header>

            <div className={style['user-reviews-page__content-body']}>
                <UserReviews />
            </div>
        </>
    );
};
