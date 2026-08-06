'use client';

import { Loader } from '@/shared/ui';
import style from '@/app/layouts/UserLayout/user-layout.module.scss';

export default function UserLoading() {
  return (
    <div className={style['user-layout__fallback']}>
      <Loader size="md" />
    </div>
  );
}
