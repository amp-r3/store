import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/shared/ui/breadcrumbs/Breadcrumbs';
import style from './page-layout.module.scss';

interface PageLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const PageLayout = ({ breadcrumbs, actions, className, children }: PageLayoutProps) => {
  return (
    <main className={`container ${style['page-layout']} ${className ?? ''}`}>
      {breadcrumbs && (
        <div className={style['page-layout__head']}>
          <Breadcrumbs items={breadcrumbs} />
          {actions}
        </div>
      )}
      {children}
    </main>
  );
};
