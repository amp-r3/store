import { createSelector } from 'reselect';
import type { ReviewModalState } from './reviewModalSlice';

const selectReviewModalState = (state: { reviewModal: ReviewModalState }) => state.reviewModal;

export const selectIsReviewModalOpen = createSelector(
  [selectReviewModalState],
  (modalState) => modalState.isOpen
);

export const selectReviewModalProductId = createSelector(
  [selectReviewModalState],
  (modalState) => modalState.productId
);

export const selectReviewModalInitialRating = createSelector(
  [selectReviewModalState],
  (modalState) => modalState.initialRating
);
