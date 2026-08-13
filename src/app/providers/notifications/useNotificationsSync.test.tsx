import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { supabase } from '@/shared/api/supabase/client';
import { setSession } from '@/entities/session';
import { useNotificationsSync } from './useNotificationsSync';

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

const AUTH_USER = {
  id: 'test-user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'test@example.com',
  role: 'user' as const,
  accessToken: 'test-token',
};

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const notificationRow = {
  id: 'notif-1',
  category: 'order',
  level: 'info',
  title: 'Your order shipped',
  body: null,
  action_path: '/user/orders',
  is_read: false,
  created_at: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  supabaseStub.__reset();
});

describe('useNotificationsSync', () => {
  it('does not subscribe to any realtime channel for a guest (no user)', () => {
    const store = createTestStore();
    renderHook(() => useNotificationsSync(), { wrapper: wrapperFor(store) });

    expect(supabaseStub.__getChannels()).toEqual([]);
  });

  it('subscribes filtered to the signed-in user, queues an incoming insert as a toast, and unsubscribes on unmount', () => {
    const store = createTestStore();
    store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
    const { unmount } = renderHook(() => useNotificationsSync(), { wrapper: wrapperFor(store) });

    const channels = supabaseStub.__getChannels();
    expect(channels).toHaveLength(1);
    expect(channels[0].config.filter).toBe('user_id=eq.test-user-id');

    supabaseStub.__emitRealtimeInsert('notifications', notificationRow);

    expect(store.getState().notification.queue).toEqual([
      expect.objectContaining({
        type: 'info',
        text: 'Your order shipped',
        key: 'center-notif-1',
        action: { label: 'View', to: '/user/orders' },
      }),
    ]);

    unmount();
    expect(supabaseStub.removeChannel).toHaveBeenCalled();
  });

  it('omits the action when the notification carries no actionPath', () => {
    const store = createTestStore();
    store.dispatch(setSession({ user: AUTH_USER, token: AUTH_USER.accessToken }));
    renderHook(() => useNotificationsSync(), { wrapper: wrapperFor(store) });

    supabaseStub.__emitRealtimeInsert('notifications', { ...notificationRow, action_path: null });

    expect(store.getState().notification.queue[0]).toEqual(
      expect.objectContaining({ action: undefined }),
    );
  });
});
