import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MiddlewareAPI } from '@reduxjs/toolkit';

// Deep-mocks the same specifier notificationMiddleware.ts itself imports
// (`@/shared/ui/toast`, not the `@/shared/ui` barrel) — see that file's own
// comment on why. Declared before importing the middleware so the mock is
// in place when the module under test resolves it.
vi.mock('@/shared/ui/toast', () => ({ showToast: vi.fn(), dismissToasts: vi.fn() }));

import { showToast, dismissToasts } from '@/shared/ui/toast';
import { notificationMiddleware } from './notificationMiddleware';
import { notify, clearNotifications } from './notificationSlice';

const mockedShowToast = vi.mocked(showToast);
const mockedDismissToasts = vi.mocked(dismissToasts);

const makeApi = () => ({ dispatch: vi.fn(), getState: vi.fn() }) as unknown as MiddlewareAPI;
const dispatchThrough = (api: MiddlewareAPI, next: ReturnType<typeof vi.fn>, action: unknown) =>
  notificationMiddleware(api)(next as unknown as (action: unknown) => unknown)(action);

const mutationRejected = (endpointName: string, data: unknown) => ({
  type: 'api/executeMutation/rejected',
  payload: { status: 'CUSTOM_ERROR', data },
  meta: {
    requestId: 'req-1',
    requestStatus: 'rejected',
    rejectedWithValue: true,
    arg: { type: 'mutation', endpointName },
  },
});

const queryRejected = (endpointName: string, data: unknown) => ({
  type: 'api/executeQuery/rejected',
  payload: { status: 'CUSTOM_ERROR', data },
  meta: {
    requestId: 'req-1',
    requestStatus: 'rejected',
    rejectedWithValue: true,
    arg: { type: 'query', endpointName },
  },
});

const mutationFulfilled = (endpointName: string, payload?: unknown) => ({
  type: 'api/executeMutation/fulfilled',
  payload,
  meta: { requestId: 'req-1', requestStatus: 'fulfilled', arg: { type: 'mutation', endpointName } },
});

beforeEach(() => {
  mockedShowToast.mockClear();
  mockedDismissToasts.mockClear();
});

describe('notificationMiddleware', () => {
  it('raises no notification for a rejected mutation on a locally-handled endpoint', () => {
    const api = makeApi();
    const next = vi.fn();

    dispatchThrough(api, next, mutationRejected('login', 'Invalid credentials'));

    expect(api.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('raises an error notification for a rejected mutation on an unlisted endpoint', () => {
    const api = makeApi();
    const next = vi.fn();

    dispatchThrough(api, next, mutationRejected('someRandomMutation', 'boom'));

    expect(api.dispatch).toHaveBeenCalledWith(notify({ type: 'error', text: 'boom' }));
  });

  it('never notifies for a rejected query, even on an unlisted endpoint', () => {
    const api = makeApi();
    const next = vi.fn();

    dispatchThrough(api, next, queryRejected('getProducts', 'boom'));

    expect(api.dispatch).not.toHaveBeenCalled();
  });

  it('clears notifications and dismisses toasts on a fulfilled signOut', () => {
    const api = makeApi();
    const next = vi.fn();

    dispatchThrough(api, next, mutationFulfilled('signOut'));

    expect(api.dispatch).toHaveBeenCalledWith(clearNotifications());
    expect(mockedDismissToasts).toHaveBeenCalledTimes(1);
    expect(mockedShowToast).toHaveBeenCalledWith('info', 'Signed out');
  });

  it('shows the configured copy and key for a fulfilled endpoint in SUCCESS_MESSAGES', () => {
    const api = makeApi();
    const next = vi.fn();

    dispatchThrough(api, next, mutationFulfilled('login'));

    expect(mockedShowToast).toHaveBeenCalledWith(
      'success',
      'Signed in',
      expect.objectContaining({ key: 'auth' }),
    );
  });

  it('raises no toast for a fulfilled endpoint with no configured success message', () => {
    const api = makeApi();
    const next = vi.fn();

    dispatchThrough(api, next, mutationFulfilled('someRandomMutation'));

    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('always forwards the action to next, regardless of whether it matched', () => {
    const api = makeApi();
    const next = vi.fn();
    const action = mutationFulfilled('login');

    dispatchThrough(api, next, action);

    expect(next).toHaveBeenCalledWith(action);
  });
});
