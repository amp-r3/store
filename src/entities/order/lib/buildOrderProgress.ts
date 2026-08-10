import { ReactNode } from 'react';
import { Order, OrderStatus, OrderStatusEvent } from '@/entities/order/model/types';
import {
  ORDER_PROGRESS_STEPS,
  ORDER_STATUS_MAP,
  TERMINAL_ORDER_STATUSES,
} from '@/entities/order/config/order-management.config';

export type OrderProgressState = 'done' | 'current' | 'upcoming';

export interface OrderProgressNode {
  status: OrderStatus;
  label: string;
  icon: ReactNode;
  state: OrderProgressState;
  at: string | null;
  isTerminalNegative: boolean;
}

export interface OrderProgressResult {
  nodes: OrderProgressNode[];
  isDerailed: boolean;
}

// Pure so the component itself stays a dumb renderer. Two shapes:
//  - happy path: order.status is one of ORDER_PROGRESS_STEPS — steps before
//    it are 'done', it is 'current', the rest are 'upcoming'.
//  - derailed (cancelled/returned/refunded): the rail stops at the last
//    happy-path step actually reached, followed by one terminal node for the
//    negative status. There is no "upcoming" after a derail.
export const buildOrderProgress = (
  order: Order,
  events: OrderStatusEvent[],
): OrderProgressResult => {
  const firstSeenAt = new Map<OrderStatus, string>();
  const sortedEvents = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (const event of sortedEvents) {
    if (!firstSeenAt.has(event.status)) {
      firstSeenAt.set(event.status, event.createdAt);
    }
  }
  if (!firstSeenAt.has('pending')) {
    firstSeenAt.set('pending', order.createdAt);
  }

  const isDerailed =
    (TERMINAL_ORDER_STATUSES as readonly OrderStatus[]).includes(order.status) &&
    order.status !== 'completed';

  if (!isDerailed) {
    const currentIndex = ORDER_PROGRESS_STEPS.findIndex((step) => step.status === order.status);
    const nodes: OrderProgressNode[] = ORDER_PROGRESS_STEPS.map((step, index) => ({
      status: step.status,
      label: step.label,
      icon: step.icon,
      state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
      at: firstSeenAt.get(step.status) ?? null,
      isTerminalNegative: false,
    }));

    return { nodes, isDerailed: false };
  }

  const reachedIndex = ORDER_PROGRESS_STEPS.reduce(
    (maxIndex, step, index) =>
      firstSeenAt.has(step.status) ? Math.max(maxIndex, index) : maxIndex,
    0,
  );

  const reachedNodes: OrderProgressNode[] = ORDER_PROGRESS_STEPS.slice(0, reachedIndex + 1).map(
    (step) => ({
      status: step.status,
      label: step.label,
      icon: step.icon,
      state: 'done',
      at: firstSeenAt.get(step.status) ?? null,
      isTerminalNegative: false,
    }),
  );

  const terminalEvent = [...sortedEvents].reverse().find((event) => event.status === order.status);

  const terminalNode: OrderProgressNode = {
    status: order.status,
    label: ORDER_STATUS_MAP[order.status]?.label ?? order.status,
    icon: null,
    state: 'current',
    at: terminalEvent?.createdAt ?? order.updatedAt,
    isTerminalNegative: true,
  };

  return { nodes: [...reachedNodes, terminalNode], isDerailed: true };
};
