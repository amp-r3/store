import { FaRegCircleCheck } from 'react-icons/fa6';
import { LuPackage } from 'react-icons/lu';

import { OrdersScope } from '@/entities/order';
import { EmptyState } from '@/shared/ui';

interface UserOrdersEmptyProps {
  variant: OrdersScope;
  /** Steers the CTA toward the other tab when it actually has orders. */
  hasOtherTabOrders: boolean;
}

export const UserOrdersEmpty = ({ variant, hasOtherTabOrders }: UserOrdersEmptyProps) => {
  if (variant === 'completed') {
    return (
      <EmptyState
        icon={<FaRegCircleCheck />}
        title="No completed orders yet"
        text="Orders appear here once they're closed — delivered, cancelled, returned or refunded."
        cta={{
          to: hasOtherTabOrders ? '/user/orders' : '/catalog',
          label: hasOtherTabOrders ? 'See active orders' : 'Browse catalog',
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={<LuPackage />}
      title="No active orders"
      text={
        hasOtherTabOrders
          ? "Everything you've ordered so far has been closed out."
          : 'Once you place an order, you can track it here.'
      }
      cta={{
        to: hasOtherTabOrders ? '/user/orders?tab=completed' : '/catalog',
        label: hasOtherTabOrders ? 'See completed orders' : 'Browse catalog',
      }}
    />
  );
};
