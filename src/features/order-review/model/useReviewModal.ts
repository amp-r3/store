import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '@/features/order-review/model/reviewSchema';
import { useAppDispatch } from "@/shared/model";
import { useAppSelector } from "@/shared/model";
import { closeReviewModal } from './reviewModalSlice';
import { selectIsReviewModalOpen, selectReviewModalProductId, selectReviewModalInitialRating } from './reviewModalSelectors';
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

  const currentUserReview = myReviews?.find(r => r.productId === Number(productId));

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const { reset } = form;

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (currentUserReview) {
        reset({
          rating: currentUserReview.rating,
          comment: currentUserReview.comment || '',
        });
      } else {
        reset({ rating: initialRating ?? 0, comment: '' });
      }
    }
  }, [isOpen, currentUserReview, initialRating, reset]);

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
    haptics
  };
};
