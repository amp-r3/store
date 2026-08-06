'use client';

import { Loader } from '@/shared/ui';
import style from '@/app/layouts/AdminLayout/admin-layout.module.scss';

export default function AdminLoading() {
  return (
    <div className={style['admin-layout__fallback']}>
      <Loader size="md" />
    </div>
  );
}
