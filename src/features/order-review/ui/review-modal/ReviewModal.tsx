import React from 'react';
import { useReviewModal } from '../../model/useReviewModal';
import { Dialog } from 'radix-ui';
import { Controller } from 'react-hook-form';
import { FaStar, FaTimes } from 'react-icons/fa';
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
    submitError,
    haptics,
  } = useReviewModal();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const commentLength = watch('comment')?.length ?? 0;

  return (
    <Dialog.Root open={!!isOpen} onOpenChange={handleOpenChange}>
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
            <FaTimes aria-hidden="true" />
          </Dialog.Close>

          <form className={style['review-modal__form']} onSubmit={handleSubmit(onSubmit)}>
            <div className={style['review-modal__field']}>
              <span id="review-rating-label" className={style['review-modal__label']}>Rating *</span>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div
                    className={style['review-modal__stars']}
                    role="radiogroup"
                    aria-labelledby="review-rating-label"
                    aria-describedby={errors.rating ? 'review-rating-error' : undefined}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={field.value === star}
                        onClick={() => {
                          field.onChange(star);
                          haptics.light();
                        }}
                        className={`${style['review-modal__star']} ${
                          star <= field.value ? style['review-modal__star--active'] : ''
                        }`}
                        aria-label={`Rate ${star} stars`}
                      >
                        <FaStar aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.rating && (
                <span id="review-rating-error" className={style['review-modal__error']} role="alert">
                  {errors.rating.message}
                </span>
              )}
            </div>

            <div className={style['review-modal__field']}>
              <div className={style['review-modal__label-row']}>
                <label htmlFor="comment" className={style['review-modal__label']}>
                  Comment (optional)
                </label>
                <span className={style['review-modal__char-count']}>
                  {commentLength}/2000
                </span>
              </div>
              <textarea
                id="comment"
                {...register('comment')}
                className={style['review-modal__textarea']}
                placeholder="What did you like or dislike? What is this product used for?"
                maxLength={2000}
                aria-describedby={errors.comment ? 'review-comment-error' : undefined}
              />
              {errors.comment && (
                <span id="review-comment-error" className={style['review-modal__error']} role="alert">
                  {errors.comment.message}
                </span>
              )}
            </div>

            {submitError && (
              <span className={style['review-modal__error']} role="alert">
                {submitError}
              </span>
            )}

            <div className={style['review-modal__footer']}>
              <button
                type="button"
                onClick={handleClose}
                className={`${style['review-modal__button']} ${style['review-modal__button--cancel']}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`${style['review-modal__button']} ${style['review-modal__button--submit']}`}
              >
                {isLoading ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
