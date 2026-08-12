import { describe, it, expect } from 'vitest';
import { buildOrderProgress } from './buildOrderProgress';
import { Order, OrderStatus, OrderStatusEvent } from '@/entities/order/model/types';
import {
  ORDER_PROGRESS_STEPS,
  ORDER_STATUS_MAP,
} from '@/entities/order/config/order-management.config';

const order = (status: OrderStatus, overrides: Partial<Order> = {}) =>
  ({
    id: 'o1',
    orderId: 'o1',
    userId: 'u1',
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }) as Order;

const event = (status: OrderStatus, createdAt: string): OrderStatusEvent => ({
  id: `e-${status}`,
  orderId: 'o1',
  status,
  paymentStatus: 'paid',
  deliveryStatus: 'dispatched',
  createdAt,
});

describe('buildOrderProgress — happy path', () => {
  it('marks steps before the current status as done, the current one as current, the rest upcoming', () => {
    const result = buildOrderProgress(order('shipped'), []);
    expect(result.isDerailed).toBe(false);
    expect(result.nodes.map((n) => n.state)).toEqual(['done', 'done', 'current', 'upcoming']);
    expect(result.nodes.map((n) => n.status)).toEqual([
      'pending',
      'processing',
      'shipped',
      'completed',
    ]);
  });

  it('injects a synthetic pending event from order.createdAt when none exists', () => {
    const result = buildOrderProgress(order('pending'), []);
    const pendingNode = result.nodes.find((n) => n.status === 'pending');
    expect(pendingNode?.at).toBe('2026-01-01T00:00:00.000Z');
  });

  it('a real pending event wins over the synthetic one (first-seen keeps the earliest)', () => {
    const events = [event('pending', '2025-12-31T00:00:00.000Z')];
    const result = buildOrderProgress(order('processing'), events);
    const pendingNode = result.nodes.find((n) => n.status === 'pending');
    expect(pendingNode?.at).toBe('2025-12-31T00:00:00.000Z');
  });

  it('duplicate events for the same status keep the earliest (first-seen)', () => {
    const events = [
      event('processing', '2026-01-05T00:00:00.000Z'),
      event('processing', '2026-01-03T00:00:00.000Z'),
    ];
    const result = buildOrderProgress(order('processing'), events);
    const node = result.nodes.find((n) => n.status === 'processing');
    expect(node?.at).toBe('2026-01-03T00:00:00.000Z');
  });

  it('sorts out-of-order events before computing first-seen, so input order does not matter', () => {
    const eventsA = [
      event('processing', '2026-01-03T00:00:00.000Z'),
      event('shipped', '2026-01-05T00:00:00.000Z'),
    ];
    const eventsB = [
      event('shipped', '2026-01-05T00:00:00.000Z'),
      event('processing', '2026-01-03T00:00:00.000Z'),
    ];
    const resultA = buildOrderProgress(order('shipped'), eventsA);
    const resultB = buildOrderProgress(order('shipped'), eventsB);
    expect(resultA.nodes.map((n) => n.at)).toEqual(resultB.nodes.map((n) => n.at));
  });

  it('"completed" is a terminal status but is NOT treated as derailed', () => {
    const result = buildOrderProgress(order('completed'), []);
    expect(result.isDerailed).toBe(false);
    expect(result.nodes[result.nodes.length - 1].state).toBe('current');
  });
});

describe('buildOrderProgress — derailed path', () => {
  it('truncates at the furthest reached step plus one terminal node', () => {
    const events = [
      event('pending', '2026-01-01T00:00:00.000Z'),
      event('processing', '2026-01-02T00:00:00.000Z'),
    ];
    const result = buildOrderProgress(order('cancelled'), events);

    expect(result.isDerailed).toBe(true);
    expect(result.nodes.map((n) => n.status)).toEqual(['pending', 'processing', 'cancelled']);
    expect(result.nodes.slice(0, 2).every((n) => n.state === 'done')).toBe(true);
  });

  it('the terminal node is current, isTerminalNegative, and there is no upcoming after it', () => {
    const result = buildOrderProgress(order('returned'), []);
    const terminal = result.nodes[result.nodes.length - 1];
    expect(terminal.status).toBe('returned');
    expect(terminal.state).toBe('current');
    expect(terminal.isTerminalNegative).toBe(true);
    expect(result.nodes.some((n) => n.state === 'upcoming')).toBe(false);
  });

  it('terminal node "at" uses the matching event when one exists', () => {
    const events = [event('cancelled', '2026-01-10T00:00:00.000Z')];
    const result = buildOrderProgress(order('cancelled'), events);
    expect(result.nodes[result.nodes.length - 1].at).toBe('2026-01-10T00:00:00.000Z');
  });

  it('terminal node "at" falls back to order.updatedAt when no matching event exists', () => {
    const result = buildOrderProgress(
      order('cancelled', { updatedAt: '2026-01-09T00:00:00.000Z' }),
      [],
    );
    expect(result.nodes[result.nodes.length - 1].at).toBe('2026-01-09T00:00:00.000Z');
  });
});

describe('config drift guard', () => {
  it('every ORDER_PROGRESS_STEPS status has an ORDER_STATUS_MAP entry', () => {
    for (const step of ORDER_PROGRESS_STEPS) {
      expect(ORDER_STATUS_MAP[step.status]).toBeDefined();
    }
  });
});
