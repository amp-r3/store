import { ReactNode } from 'react';
import style from './summary-total-row.module.scss';

export interface SummaryTotalRowProps {
  label: ReactNode;
  value: ReactNode;
  isFinal?: boolean;
  valueVariant?: 'free' | 'discount' | 'fee';
}

export const SummaryTotalRow = ({ label, value, isFinal, valueVariant }: SummaryTotalRowProps) => (
  <div
    className={[style['total-row'], isFinal ? style['total-row--final'] : '']
      .filter(Boolean)
      .join(' ')}
  >
    <span className={style['total-row__label']}>{label}</span>
    <span
      className={[
        style['total-row__value'],
        valueVariant ? style[`total-row__value--${valueVariant}`] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {value}
    </span>
  </div>
);

export interface SummaryTotalBadgeProps {
  children: ReactNode;
  variant?: 'discount';
}

export const SummaryTotalBadge = ({ children, variant }: SummaryTotalBadgeProps) => (
  <span
    className={[style['total-row__badge'], variant ? style[`total-row__badge--${variant}`] : '']
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </span>
);
