import Skeleton from 'react-loading-skeleton';

import { OrderCounts, OrdersScope } from '@/entities/order';
import { SegmentedTabs, type SegmentedTabItem } from '@/shared/ui';

interface UserOrdersTabsProps {
  tab: OrdersScope;
  counts?: OrderCounts;
  onChange: (tab: OrdersScope) => void;
}

const LABELS: Record<OrdersScope, string> = {
  active: 'Active',
  completed: 'Completed',
};

export const UserOrdersTabs = ({ tab, counts, onChange }: UserOrdersTabsProps) => {
  const items: SegmentedTabItem<OrdersScope>[] = (['active', 'completed'] as const).map((id) => ({
    id,
    label: LABELS[id],
    count: counts ? counts[id] : <Skeleton width={16} height={12} inline />,
  }));

  return (
    <SegmentedTabs
      items={items}
      value={tab}
      onChange={onChange}
      idPrefix="user-orders"
      ariaLabel="Order sections"
    />
  );
};
