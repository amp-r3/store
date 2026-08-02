import { FaStar, FaRegStar } from 'react-icons/fa';

import style from './rating-stars.module.scss';

export type RatingStarsSize = 'sm' | 'md' | 'lg';
export type RatingStarsTone = 'default' | 'accent';

interface RatingStarsProps {
  /** Rounded to the nearest whole star. */
  value: number;
  label: string;
  size?: RatingStarsSize;
  tone?: RatingStarsTone;
  className?: string;
}

export const RatingStars = ({ value, label, size = 'md', tone = 'default', className }: RatingStarsProps) => (
  <span
    role="img"
    aria-label={label}
    className={[style['rating-stars'], style[`rating-stars--${size}`], style[`rating-stars--${tone}`], className]
      .filter(Boolean)
      .join(' ')}
  >
    {Array.from({ length: 5 }, (_, i) =>
      i < Math.round(value) ? (
        <FaStar key={i} className={style['rating-stars__star--filled']} aria-hidden="true" />
      ) : (
        <FaRegStar key={i} className={style['rating-stars__star--empty']} aria-hidden="true" />
      )
    )}
  </span>
);
