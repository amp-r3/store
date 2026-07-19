import { UserReviews } from '@/widgets/user-reviews';

import style from './user-reviews-page.module.scss';

export const UserReviewsPage = () => {
    return (
        <>
            <header className={style.contentHeader}>
                <h1 className={style.title}>My Reviews</h1>
                <p className={style.subtitle}>
                    Everything you&apos;ve rated, plus what&apos;s still waiting for your verdict.
                </p>
            </header>

            <div className={style.contentBody}>
                <UserReviews />
            </div>
        </>
    );
};
