import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '@/features/order-review/model/reviewSchema';
import { useAppDispatch } from '@/shared/model';
import { useAppSelector } from '@/shared/model';
import { closeReviewModal } from './reviewModalSlice';
import {
  selectIsReviewModalOpen,
  selectReviewModalProductId,
  selectReviewModalInitialRating,
} from './reviewModalSelectors';
import { useGetMyReviewsQuery, useAddOrUpdateReviewMutation } from '@/entities/review';
import { useHaptics } from '@/shared/lib/hooks';
import { getErrorMessage } from '@/shared/lib';

export const useReviewModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsReviewModalOpen);
  const productId = useAppSelector(selectReviewModalProductId);
  const initialRating = useAppSelector(selectReviewModalInitialRating);
  const haptics = useHaptics();

  const { data: myReviews } = useGetMyReviewsQuery(undefined, { skip: !productId });
  const [addOrUpdateReview, { isLoading }] = useAddOrUpdateReviewMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentUserReview = productId
    ? myReviews?.find((r) => r.productId === Number(productId))
    : undefined;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const { reset } = form;

  // Read via refs, not reactive deps — a refetch/late resolution of
  // myReviews while the modal is already open must not reset the form and
  // discard whatever the user has typed. Only opening the modal should.
  const currentUserReviewRef = useRef(currentUserReview);
  currentUserReviewRef.current = currentUserReview;
  const initialRatingRef = useRef(initialRating);
  initialRatingRef.current = initialRating;

  useEffect(() => {
    if (!isOpen) return;
    setSubmitError(null);
    const review = currentUserReviewRef.current;
    if (review) {
      reset({ rating: review.rating, comment: review.comment || '' });
    } else {
      reset({ rating: initialRatingRef.current ?? 0, comment: '' });
    }
  }, [isOpen, reset]);

  const handleClose = () => dispatch(closeReviewModal());

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!productId) return;
    setSubmitError(null);
    try {
      await addOrUpdateReview({
        productId: Number(productId),
        rating: data.rating,
        comment: data.comment || '',
      }).unwrap();

      haptics.success();
      handleClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  return {
    isOpen,
    isLoading,
    isEditMode: !!currentUserReview,
    form,
    handleOpenChange,
    handleClose,
    onSubmit,
    submitError,
    haptics,
  };
};
