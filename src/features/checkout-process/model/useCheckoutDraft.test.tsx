import { describe, it, expect, vi, afterEach } from 'vitest';
import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useForm } from 'react-hook-form';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { seedLastShippingAddress } from '@test/seedApi';
import { makeCheckoutDraft, makeDeliveryMethod, makePaymentMethod } from '@test/fixtures';
import { DeliveryMethod, PaymentMethod, ShippingAddress } from '@/entities/order';
import { CheckoutFormValues } from './checkoutMasterSchema';
import { saveCheckoutDraft } from './checkoutSlice';
import { useCheckoutDraft } from './useCheckoutDraft';

// sanitizeCheckoutDraft.test.ts already covers the id/code-blanking logic
// itself — these tests cover the hook's wiring: restoring a draft once
// method lists arrive, the previous-address fallback, and the debounced
// autosave.

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const renderDraft = (
  store: AppStore,
  initialProps: { deliveryMethods?: DeliveryMethod[]; paymentMethods?: PaymentMethod[] } = {},
) =>
  renderHook(
    ({ deliveryMethods, paymentMethods }) => {
      const methods = useForm<CheckoutFormValues>();
      const draft = useCheckoutDraft({ methods, deliveryMethods, paymentMethods });
      return { methods, ...draft };
    },
    { wrapper: wrapperFor(store), initialProps },
  );

afterEach(() => {
  vi.useRealTimers();
});

describe('useCheckoutDraft — restore', () => {
  it('restores a stored draft once method lists arrive, sanitizing a stale method id', async () => {
    const store = createTestStore();
    const validDelivery = makeDeliveryMethod({ id: 'delivery-valid', code: 'standard' });
    const draft = makeCheckoutDraft({
      firstName: 'Alice',
      deliveryMethodId: 'delivery-stale',
      deliveryMethodCode: 'standard',
    });
    store.dispatch(saveCheckoutDraft(draft));

    const { result, rerender } = renderDraft(store, {
      deliveryMethods: undefined,
      paymentMethods: undefined,
    });

    // Not yet restored: method lists aren't available.
    expect(result.current.methods.getValues('firstName')).not.toBe('Alice');

    rerender({ deliveryMethods: [validDelivery], paymentMethods: [] });

    await waitFor(() => expect(result.current.methods.getValues('firstName')).toBe('Alice'));
    // The stale delivery id doesn't match validDelivery.id, so it's blanked.
    expect(result.current.methods.getValues('deliveryMethodId')).toBe('');
  });

  it('does not restore when there is no stored draft', () => {
    const store = createTestStore();
    const { result } = renderDraft(store, {
      deliveryMethods: [makeDeliveryMethod()],
      paymentMethods: [makePaymentMethod()],
    });

    expect(result.current.methods.getValues('firstName')).toBeUndefined();
  });
});

describe('useCheckoutDraft — previous address', () => {
  const address: ShippingAddress = {
    firstName: 'Prior',
    lastName: 'User',
    email: 'prior@example.com',
    phone: '+15551234567',
    city: 'Boston',
  };

  it('exposes the last shipping address and fills the form on request, when no draft existed at mount', async () => {
    const store = createTestStore();
    await seedLastShippingAddress(store, address);

    const { result } = renderDraft(store);

    await waitFor(() => expect(result.current.hasPreviousAddress).toBe(true));
    expect(result.current.showPreviousAddressChip).toBe(true);

    act(() => result.current.applyPreviousAddress());

    expect(result.current.methods.getValues('city')).toBe('Boston');
  });

  it('suppresses the previous-address chip when a draft already existed at mount', () => {
    const store = createTestStore();
    store.dispatch(saveCheckoutDraft(makeCheckoutDraft()));

    const { result } = renderDraft(store, {
      deliveryMethods: [makeDeliveryMethod()],
      paymentMethods: [makePaymentMethod()],
    });

    expect(result.current.showPreviousAddressChip).toBe(false);
    // getLastShippingAddress is skipped whenever a draft existed at mount.
    expect(result.current.hasPreviousAddress).toBe(false);
  });
});

describe('useCheckoutDraft — autosave', () => {
  it('debounces form changes into checkout.draft, coalescing rapid edits', () => {
    vi.useFakeTimers();
    const store = createTestStore();
    const { result } = renderDraft(store);

    act(() => {
      result.current.methods.setValue('firstName', 'J');
      result.current.methods.setValue('firstName', 'Ja');
      result.current.methods.setValue('firstName', 'Jane');
    });

    expect(store.getState().checkout.draft).toBeNull();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(store.getState().checkout.draft?.firstName).toBe('Jane');
  });
});
