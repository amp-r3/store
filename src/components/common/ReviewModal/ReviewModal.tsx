import React, { useEffect } from 'react';
import { Dialog } from 'radix-ui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useReviewModal } from '@/hooks/features/review';
import style from './review-modal.module.scss';

export const ReviewModal: React.FC = () => {
  const {
    isOpen,
    isLoading,
    isEditMode,
    form,
    handleOpenChange,
    handleClose,
    onSubmit,
    haptics,
  } = useReviewModal();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={document.getElementById('modal-root')}>
        <Dialog.Overlay className={style['review-modal__overlay']} />
        <Dialog.Content className={style['review-modal__content']}>
          <Dialog.Title className={style['review-modal__title']}>
            {isEditMode ? 'Edit Review' : 'Write a Review'}
          </Dialog.Title>
          <Dialog.Description className={style['review-modal__description']}>
            Share your thoughts about this product with other customers.
          </Dialog.Description>
          
          <Dialog.Close className={style['review-modal__close']} aria-label="Close">
            <FaTimes />
          </Dialog.Close>

          <div className={style['review-modal__form']}>
            <div className={style['review-modal__field']}>
              <span className={style['review-modal__label']}>Rating *</span>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div className={style['review-modal__stars']}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          field.onChange(star);
                          haptics.light();
                        }}
                        className={`${style['review-modal__star']} ${
                          star <= field.value ? style['review-modal__star--active'] : ''
                        }`}
                        aria-label={`Rate ${star} stars`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.rating && <span className={style['review-modal__error']}>{errors.rating.message}</span>}
            </div>

            <div className={style['review-modal__field']}>
              <label htmlFor="comment" className={style['review-modal__label']}>
                Comment (optional)
              </label>
              <textarea
                id="comment"
                {...register('comment')}
                className={style['review-modal__textarea']}
                placeholder="What did you like or dislike? What is this product used for?"
              />
              {errors.comment && <span className={style['review-modal__error']}>{errors.comment.message}</span>}
            </div>

            <div className={style['review-modal__footer']}>
              <button
                type="button"
                onClick={handleClose}
                className={`${style['review-modal__button']} ${style['review-modal__button--cancel']}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className={`${style['review-modal__button']} ${style['review-modal__button--submit']}`}
              >
                {isLoading ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
