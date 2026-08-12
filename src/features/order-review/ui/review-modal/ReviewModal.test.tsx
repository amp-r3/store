import { describe, it, expect, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import type { SupabaseStub } from '@test/supabaseStub';
import { renderWithProviders, createTestStore } from '@test/renderWithProviders';
import { seedMyReviews } from '@test/seedApi';
import { supabase } from '@/shared/api/supabase/client';
import { openReviewModal, ReviewModal } from '@/features/order-review';
import { ProductReview } from '@/entities/review';

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const supabaseStub = supabase as unknown as SupabaseStub;

describe('ReviewModal', () => {
  it('is closed until openReviewModal is dispatched, then shows the create-mode title', async () => {
    const store = createTestStore();
    await seedMyReviews(store, []);
    renderWithProviders(<ReviewModal />, { store });

    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();

    act(() => {
      store.dispatch(openReviewModal('42'));
    });

    expect(await screen.findByText('Write a Review')).toBeInTheDocument();
  });

  it('clicking a star sets aria-checked and clears a prior rating error', async () => {
    const store = createTestStore();
    await seedMyReviews(store, []);
    const { user } = renderWithProviders(<ReviewModal />, { store });
    act(() => {
      store.dispatch(openReviewModal('42'));
    });
    await screen.findByText('Write a Review');

    await user.click(screen.getByRole('button', { name: 'Submit Review' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please select a rating');

    await user.click(screen.getByRole('radio', { name: 'Rate 4 stars' }));

    expect(screen.getByRole('radio', { name: 'Rate 4 stars' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.queryByText('Please select a rating')).not.toBeInTheDocument();
  });

  it('blocks submission at rating 0 and never calls the mutation', async () => {
    const store = createTestStore();
    await seedMyReviews(store, []);
    const { user } = renderWithProviders(<ReviewModal />, { store });
    act(() => {
      store.dispatch(openReviewModal('42'));
    });
    await screen.findByText('Write a Review');

    await user.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please select a rating');
    expect(supabaseStub.rpc).not.toHaveBeenCalled();
  });

  it('tracks the comment character count', async () => {
    const store = createTestStore();
    await seedMyReviews(store, []);
    const { user } = renderWithProviders(<ReviewModal />, { store });
    act(() => {
      store.dispatch(openReviewModal('42'));
    });
    await screen.findByText('Write a Review');

    expect(screen.getByText('0/2000')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Comment (optional)'), 'Great fit');

    expect(screen.getByText('9/2000')).toBeInTheDocument();
  });

  it('pre-fills rating/comment and shows the edit-mode title for an existing review', async () => {
    const existingReview: ProductReview = {
      id: 1,
      productId: 42,
      rating: 4,
      comment: 'Great fit',
      date: '2024-01-01T00:00:00.000Z',
      helpfulCount: 0,
      reviewerName: 'Jane',
      userId: 'test-user-id',
      isLiked: false,
      isEdited: false,
      isVerified: true,
    };
    const store = createTestStore();
    await seedMyReviews(store, [existingReview]);
    renderWithProviders(<ReviewModal />, { store });
    act(() => {
      store.dispatch(openReviewModal('42'));
    });

    expect(await screen.findByText('Edit Review')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Rate 4 stars' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByLabelText('Comment (optional)')).toHaveValue('Great fit');
  });

  it('surfaces a failed mutation as an alert and keeps the dialog open', async () => {
    supabaseStub.__setRpc({ error: { code: 'P0001', message: 'Review submission failed' } });
    const store = createTestStore();
    await seedMyReviews(store, []);
    const { user } = renderWithProviders(<ReviewModal />, { store });
    act(() => {
      store.dispatch(openReviewModal('42'));
    });
    await screen.findByText('Write a Review');

    await user.click(screen.getByRole('radio', { name: 'Rate 5 stars' }));
    await user.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Review submission failed');
    expect(store.getState().reviewModal.isOpen).toBe(true);
  });

  it('dispatches closeReviewModal from both Cancel and the close button', async () => {
    const store = createTestStore();
    await seedMyReviews(store, []);
    const { user } = renderWithProviders(<ReviewModal />, { store });
    act(() => {
      store.dispatch(openReviewModal('42'));
    });
    await screen.findByText('Write a Review');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(store.getState().reviewModal.isOpen).toBe(false);

    act(() => {
      store.dispatch(openReviewModal('42'));
    });
    await screen.findByText('Write a Review');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(store.getState().reviewModal.isOpen).toBe(false);
  });
});
