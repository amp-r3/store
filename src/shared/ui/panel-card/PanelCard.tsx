import { ReactNode } from 'react';
import Link from 'next/link';

import style from './panel-card.module.scss';

interface PanelCardProps {
  title: string;
  /** A control rendered in the header, e.g. a period switcher. */
  action?: ReactNode;
  /** "View all" link to the panel's full page. */
  to?: string;
  children: ReactNode;
}

export const PanelCard = ({ title, action, to, children }: PanelCardProps) => (
  <section className={style['panel-card']}>
    <header className={style['panel-card__header']}>
      <h2 className={style['panel-card__title']}>{title}</h2>
      <div className={style['panel-card__controls']}>
        {action}
        {to && (
          <Link href={to} className={style['panel-card__view-all']}>
            View all
          </Link>
        )}
      </div>
    </header>

    <div className={style['panel-card__body']}>{children}</div>
  </section>
);
