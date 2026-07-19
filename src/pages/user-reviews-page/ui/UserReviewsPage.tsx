import { selectUser } from '@/entities/session';
import { Breadcrumbs } from '@/shared/ui';
import { useAppSelector } from '@/shared/model';
import { ProfileSidebar } from '@/widgets/profile-sidebar';
import { UserReviews } from '@/widgets/user-reviews';

import style from './user-reviews-page.module.scss';

export const UserReviewsPage = () => {
    const user = useAppSelector(selectUser);

    if (!user) return null;

    return (
        <main className={`container ${style.page}`}>
            <div className={style.header__wrapper}>
                <Breadcrumbs
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Profile', path: '/user' },
                        { label: 'My Reviews' },
                    ]}
                />
            </div>

            <article className={style.pageWrapper}>
                <ProfileSidebar user={user} />

                <section className={style.contentArea}>
                    <header className={style.contentHeader}>
                        <h1 className={style.title}>My Reviews</h1>
                        <p className={style.subtitle}>
                            Everything you&apos;ve rated, plus what&apos;s still waiting for your verdict.
                        </p>
                    </header>

                    <div className={style.contentBody}>
                        <UserReviews />
                    </div>
                </section>
            </article>
        </main>
    );
};
