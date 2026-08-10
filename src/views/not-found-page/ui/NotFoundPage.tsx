import style from './page404.module.scss';
import Link from 'next/link';
import { TbHome } from 'react-icons/tb';
import { useHaptics } from '@/shared/lib/hooks';
import { PageLayout, HOME_CRUMB } from '@/shared/ui';

export const Page404 = () => {
  const { light } = useHaptics();
  return (
    <PageLayout
      breadcrumbs={[HOME_CRUMB, { label: 'Page Not Found' }]}
      className={style.notFoundPage}
    >
      <div className={style.content}>
        <h1 className={style.errorCode}>404</h1>
        <h2 className={style.title}>Page Not Found</h2>
        <p className={style.description}>
          Oops! The page you were looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className={style.homeButton} onClick={light}>
          <TbHome size={20} />
          <span>Go to Homepage</span>
        </Link>
      </div>
    </PageLayout>
  );
};
