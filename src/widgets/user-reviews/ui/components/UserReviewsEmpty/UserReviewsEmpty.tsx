import { FaRegStar, FaRegCheckCircle } from 'react-icons/fa';

import { EmptyState } from '@/shared/ui';

interface UserReviewsEmptyProps {
  variant: 'written' | 'pending';
  /** Steers the CTA: nudge toward pending items when the user has some. */
  hasPending: boolean;
}

export const UserReviewsEmpty = ({ variant, hasPending }: UserReviewsEmptyProps) => {
  if (variant === 'pending') {
    return (
      <EmptyState
        icon={<FaRegCheckCircle />}
        title="All caught up"
        text="You've reviewed everything you bought. Nothing is waiting on you."
        cta={{ to: '/catalog', label: 'Browse catalog' }}
      />
    );
  }

  return (
    <EmptyState
      icon={<FaRegStar />}
      title="No reviews yet"
      text={
        hasPending
          ? 'You have purchases waiting for a rating — the Pending tab has them all.'
          : 'Once you buy something, you can share what you think about it here.'
      }
      cta={{
        to: hasPending ? '/user/reviews?tab=pending' : '/catalog',
        label: hasPending ? 'See pending items' : 'Browse catalog',
      }}
    />
  );
};
