import { SegmentedTabs, type SegmentedTabItem } from '@/shared/ui';

export type ReviewsTab = 'written' | 'pending';

interface UserReviewsTabsProps {
  tab: ReviewsTab;
  writtenCount: number;
  pendingCount: number;
  onChange: (tab: ReviewsTab) => void;
  panelId: string;
}

export const UserReviewsTabs = ({
  tab,
  writtenCount,
  pendingCount,
  onChange,
  panelId,
}: UserReviewsTabsProps) => {
  const items: SegmentedTabItem<ReviewsTab>[] = [
    { id: 'written', label: 'Written', count: writtenCount },
    { id: 'pending', label: 'Pending', count: pendingCount },
  ];

  return (
    <SegmentedTabs
      items={items}
      value={tab}
      onChange={onChange}
      idPrefix="user-reviews"
      ariaLabel="Review sections"
      panelId={panelId}
    />
  );
};
