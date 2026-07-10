import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReviewModalState {
  isOpen: boolean;
  productId: string | null;
}

const initialState: ReviewModalState = {
  isOpen: false,
  productId: null,
};

export const reviewModalSlice = createSlice({
  name: 'reviewModal',
  initialState,
  reducers: {
    openReviewModal: (state, action: PayloadAction<string>) => {
      state.isOpen = true;
      state.productId = action.payload;
    },
    closeReviewModal: (state) => {
      state.isOpen = false;
      state.productId = null;
    },
  },
});

export const { openReviewModal, closeReviewModal } = reviewModalSlice.actions;
export default reviewModalSlice.reducer;
