import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector, useHaptics } from '@/hooks';
import { selectIsReviewModalOpen, selectReviewModalProductId, closeReviewModal } from '@/store';
import { useAddOrUpdateReviewMutation, useGetReviewsQuery } from '@/services/reviewApi';
import { reviewSchema, ReviewFormData } from '@/schemas/reviewSchema';

export const useReviewModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsReviewModalOpen);
  const productId = useAppSelector(selectReviewModalProductId);
  const user = useAppSelector((state) => state.auth.user);
  const haptics = useHaptics();
  
  const { data: reviews } = useGetReviewsQuery(Number(productId), { skip: !productId });
  const [addOrUpdateReview, { isLoading }] = useAddOrUpdateReviewMutation();

  const currentUserReview = reviews?.find(r => r.userId === user?.id);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const { reset } = form;

  useEffect(() => {
    if (isOpen) {
      if (currentUserReview) {
        reset({
          rating: currentUserReview.rating,
          comment: currentUserReview.comment || '',
        });
      } else {
        reset({ rating: 0, comment: '' });
      }
    }
  }, [isOpen, currentUserReview, reset]);

  const handleClose = () => dispatch(closeReviewModal());
  
  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!productId) return;
    try {
      await addOrUpdateReview({
        productId: Number(productId),
        rating: data.rating,
        comment: data.comment || '',
      }).unwrap();
      
      haptics.success();
      handleClose();
    } catch (err) {
      console.error(err);
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
    haptics
  };
};
