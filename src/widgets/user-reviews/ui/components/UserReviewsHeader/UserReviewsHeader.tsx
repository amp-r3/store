import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { FaPenNib, FaStar, FaThumbsUp, FaHourglassHalf } from 'react-icons/fa';

import { ProductReview } from '@/entities/review';
import { StatTile } from '@/shared/ui';

import style from './user-reviews-header.module.scss';

interface UserReviewsHeaderProps {
  reviews: ProductReview[];
  pendingCount: number;
  isLoading: boolean;
}

export const UserReviewsHeader = ({ reviews, pendingCount, isLoading }: UserReviewsHeaderProps) => {
  const { averageRating, helpfulTotal } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, helpfulTotal: 0 };
    }

    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const helpfulSum = reviews.reduce((sum, review) => sum + review.helpfulCount, 0);

    return {
      averageRating: ratingSum / reviews.length,
      helpfulTotal: helpfulSum,
    };
  }, [reviews]);

  const tiles = [
    {
      key: 'written',
      icon: <FaPenNib />,
      value: reviews.length,
      label: reviews.length === 1 ? 'Review written' : 'Reviews written',
    },
    {
      key: 'average',
      icon: <FaStar />,
      value: reviews.length > 0 ? averageRating.toFixed(1) : '—',
      label: 'Average you gave',
    },
    {
      key: 'helpful',
      icon: <FaThumbsUp />,
      value: helpfulTotal,
      label: 'Helpful votes earned',
    },
    {
      key: 'pending',
      icon: <FaHourglassHalf />,
      value: pendingCount,
      label: 'Waiting for a rating',
    },
  ];

  return (
    <div className={style['reviews-header']}>
      {tiles.map((tile) => (
        <StatTile
          key={tile.key}
          icon={tile.icon}
          label={tile.label}
          value={isLoading ? <Skeleton width={64} height={32} /> : tile.value}
          size="md"
          layout="column"
        />
      ))}
    </div>
  );
};
