import { UserReviews } from '@/widgets/user-reviews';
import { SectionHeader } from '@/shared/ui';

export const UserReviewsPage = () => {
  return (
    <>
      <SectionHeader
        title="My Reviews"
        subtitle="Everything you've rated, plus what's still waiting for your verdict."
      />

      <UserReviews />
    </>
  );
};
