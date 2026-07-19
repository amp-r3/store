import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReviewModalState {
  isOpen: boolean;
  productId: string | null;
  /** Rating to pre-select when opening from a star click; ignored when editing. */
  initialRating: number | null;
}

const initialState: ReviewModalState = {
  isOpen: false,
  productId: null,
  initialRating: null,
};

export const reviewModalSlice = createSlice({
  name: 'reviewModal',
  initialState,
  reducers: {
    openReviewModal: {
      reducer: (state, action: PayloadAction<{ productId: string; initialRating?: number }>) => {
        state.isOpen = true;
        state.productId = action.payload.productId;
        state.initialRating = action.payload.initialRating ?? null;
      },
      prepare: (productId: string, initialRating?: number) => ({
        payload: { productId, initialRating },
      }),
    },
    closeReviewModal: (state) => {
      state.isOpen = false;
      state.productId = null;
      state.initialRating = null;
    },
  },
});

export const { openReviewModal, closeReviewModal } = reviewModalSlice.actions;
export const reviewModalReducer = reviewModalSlice.reducer;
export default reviewModalSlice.reducer;
