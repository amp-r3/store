import { describe, it, expect } from 'vitest';
import { selectNotification, selectPendingCount } from './notificationSelectors';
import { AppNotification, NotificationState } from './notificationSlice';

const notif = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 1,
  type: 'info',
  text: 'A notification',
  ...overrides,
});

const stateWith = (notification: NotificationState) => ({ notification });

describe('selectNotification', () => {
  it('returns the head of the queue when online', () => {
    const first = notif({ id: 1 });
    const second = notif({ id: 2 });
    const state = stateWith({ queue: [first, second], isOffline: false, nextId: 3 });

    expect(selectNotification(state)).toBe(first);
  });

  it('returns null when online with an empty queue', () => {
    const state = stateWith({ queue: [], isOffline: false, nextId: 1 });

    expect(selectNotification(state)).toBeNull();
  });

  // The offline banner shadows whatever real notification is at the head
  // of the queue — a genuine error toast queued while offline is invisible
  // until connectivity returns, not shown alongside the offline banner.
  it('returns the synthetic offline notification when offline, even with a real one queued', () => {
    const state = stateWith({ queue: [notif({ id: 1 })], isOffline: true, nextId: 2 });

    const result = selectNotification(state);
    expect(result?.id).toBe(-1);
    expect(result?.text).toBe('No internet connection');
    expect(result?.sticky).toBe(true);
  });
});

describe('selectPendingCount', () => {
  it('is 0 when the queue is empty (online)', () => {
    expect(selectPendingCount(stateWith({ queue: [], isOffline: false, nextId: 1 }))).toBe(0);
  });

  // The visible slot is occupied by whatever selectNotification renders, so
  // "pending" (i.e. still waiting behind it) is queue.length - 1 while
  // online — this is the exact off-by-one a careless "simplification"
  // would flip.
  it('is queue.length - 1 while online (the head is the visible one, not pending)', () => {
    const queue = [notif({ id: 1 }), notif({ id: 2 }), notif({ id: 3 })];
    expect(selectPendingCount(stateWith({ queue, isOffline: false, nextId: 4 }))).toBe(2);
  });

  it('never goes negative for a single-item queue online', () => {
    expect(selectPendingCount(stateWith({ queue: [notif()], isOffline: false, nextId: 2 }))).toBe(
      0,
    );
  });

  // Offline, the visible slot is occupied by the synthetic banner instead
  // of a real queue item, so every queued item counts as pending.
  it('is the full queue length while offline', () => {
    const queue = [notif({ id: 1 }), notif({ id: 2 })];
    expect(selectPendingCount(stateWith({ queue, isOffline: true, nextId: 3 }))).toBe(2);
  });

  it('is 0 offline with an empty queue', () => {
    expect(selectPendingCount(stateWith({ queue: [], isOffline: true, nextId: 1 }))).toBe(0);
  });
});
