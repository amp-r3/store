import { describe, it, expect } from 'vitest';
import {
  notificationSlice,
  notify,
  dismissNotification,
  clearNotifications,
  setOffline,
  NotificationState,
} from './notificationSlice';

const reducer = notificationSlice.reducer;

const emptyState: NotificationState = { queue: [], isOffline: false, nextId: 1 };

describe('notify', () => {
  it('assigns monotonically increasing ids from nextId', () => {
    let state = reducer(emptyState, notify({ type: 'info', text: 'one' }));
    state = reducer(state, notify({ type: 'info', text: 'two' }));
    expect(state.queue.map((n) => n.id)).toEqual([1, 2]);
    expect(state.nextId).toBe(3);
  });

  it('a repeat key replaces the existing entry in place rather than appending', () => {
    let state = reducer(emptyState, notify({ type: 'info', text: 'first', key: 'k1' }));
    state = reducer(state, notify({ type: 'info', text: 'other' }));
    state = reducer(state, notify({ type: 'success', text: 'updated', key: 'k1' }));

    expect(state.queue).toHaveLength(2);
    expect(state.queue[0]).toMatchObject({ key: 'k1', text: 'updated', type: 'success' });
  });

  it('caps the queue at 5 by evicting the oldest non-sticky entry', () => {
    let state = emptyState;
    for (let i = 0; i < 5; i++) {
      state = reducer(state, notify({ type: 'info', text: `n${i}` }));
    }
    expect(state.queue).toHaveLength(5);

    state = reducer(state, notify({ type: 'info', text: 'n5' }));
    expect(state.queue).toHaveLength(5);
    expect(state.queue.map((n) => n.text)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);
  });

  it('a queue of all-sticky notifications still stays capped at MAX_QUEUE, evicting the oldest', () => {
    let state = emptyState;
    for (let i = 0; i < 5; i++) {
      state = reducer(state, notify({ type: 'warning', text: `s${i}`, sticky: true }));
    }
    expect(state.queue).toHaveLength(5);

    state = reducer(state, notify({ type: 'warning', text: 's5', sticky: true }));
    expect(state.queue).toHaveLength(5);
    expect(state.queue.map((n) => n.text)).toEqual(['s1', 's2', 's3', 's4', 's5']);
  });

  it('prefers evicting the oldest non-sticky entry over a sticky one', () => {
    let state = reducer(emptyState, notify({ type: 'warning', text: 'sticky', sticky: true }));
    for (let i = 0; i < 5; i++) {
      state = reducer(state, notify({ type: 'info', text: `n${i}` }));
    }
    expect(state.queue).toHaveLength(5);
    expect(state.queue.map((n) => n.text)).toEqual(['sticky', 'n1', 'n2', 'n3', 'n4']);
  });
});

describe('dismissNotification', () => {
  it('removes the notification with the given id', () => {
    let state = reducer(emptyState, notify({ type: 'info', text: 'a' }));
    state = reducer(state, dismissNotification(1));
    expect(state.queue).toHaveLength(0);
  });

  it('is a no-op for an unknown id', () => {
    let state = reducer(emptyState, notify({ type: 'info', text: 'a' }));
    state = reducer(state, dismissNotification(999));
    expect(state.queue).toHaveLength(1);
  });
});

describe('clearNotifications / setOffline', () => {
  it('clearNotifications empties the queue', () => {
    let state = reducer(emptyState, notify({ type: 'info', text: 'a' }));
    state = reducer(state, clearNotifications());
    expect(state.queue).toEqual([]);
  });

  it('setOffline toggles independently of the queue', () => {
    let state = reducer(emptyState, notify({ type: 'info', text: 'a' }));
    state = reducer(state, setOffline(true));
    expect(state.isOffline).toBe(true);
    expect(state.queue).toHaveLength(1);
  });
});
