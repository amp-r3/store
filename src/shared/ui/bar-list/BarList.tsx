import { ReactNode } from 'react';

import style from './bar-list.module.scss';

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  /** Formatted value, rendered at the row's tip. */
  formattedValue: string;
  /** Optional trailing detail, e.g. a fee-rate chip. */
  meta?: ReactNode;
}

interface BarListProps {
  items: BarListItem[];
}

export const BarList = ({ items }: BarListProps) => {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className={style['bar-list']}>
      {items.map((item) => (
        <li key={item.key} className={style['bar-list__row']}>
          <div className={style['bar-list__heading']}>
            <span className={style['bar-list__label']}>{item.label}</span>
            <span className={style['bar-list__value']}>{item.formattedValue}</span>
          </div>
          <div className={style['bar-list__track']}>
            <div
              className={style['bar-list__fill']}
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0)}%` }}
            />
          </div>
          {item.meta && <div className={style['bar-list__meta']}>{item.meta}</div>}
        </li>
      ))}
    </ul>
  );
};
