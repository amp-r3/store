import { createSelector } from 'reselect';
import { RootState } from '@/app/store';

const selectReviewModalState = (state: RootState) => state.reviewModal;

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
