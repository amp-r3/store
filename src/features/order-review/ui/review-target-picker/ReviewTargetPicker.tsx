import { Dialog } from 'radix-ui';
import { Drawer } from 'vaul';
import { FC, memo } from 'react';
import { IoClose } from 'react-icons/io5';
import { LuStar } from 'react-icons/lu';
import { EnrichedOrderItem } from '@/entities/order';
import style from './review-target-picker.module.scss';
import { useMediaQuery } from '@/shared/lib/hooks';
import { getModalRoot, ignoreToastInteraction } from '@/shared/lib';
import { EmptyState } from '@/shared/ui';
import { OrderItem } from '@/entities/order';
import { OrderItemSkeleton } from '@/entities/order';

interface ReviewTargetPickerProps {
  orderItems: EnrichedOrderItem[];
  onOpenChange(open: boolean): void;
  onAction(item: EnrichedOrderItem): void;
  isLoading: boolean;
  isOpen: boolean;
}

interface ReviewTargetRowProps {
  item: EnrichedOrderItem;
  onSelect(item: EnrichedOrderItem): void;
}

const ReviewTargetRow = memo<ReviewTargetRowProps>(({ item, onSelect }) => (
  <div className={style['review-target']}>
    <OrderItem item={item} linkToProduct={false} />
    <button
      type="button"
      className={style['review-target__trigger']}
      onClick={() => onSelect(item)}
      aria-label={`Rate ${item.product.title}`}
    />
  </div>
));

ReviewTargetRow.displayName = 'ReviewTargetRow';

export const ReviewTargetPicker: FC<ReviewTargetPickerProps> = ({
  orderItems,
  isOpen,
  onOpenChange,
  onAction,
  isLoading,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const modalRoot = getModalRoot();

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={onOpenChange} direction="bottom">
        <Drawer.Portal container={modalRoot}>
          <Drawer.Overlay className={style['review-drawer__overlay']} />
          <Drawer.Content
            className={style['review-drawer__content']}
            aria-label="Which item you want to rate"
            onPointerDownOutside={ignoreToastInteraction}
          >
            <Drawer.Handle className={style['review-drawer__handle']} />

            <button
              className={style['review-drawer__close-btn']}
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <IoClose size={20} />
            </button>

            <div className={style['review-drawer__header']}>
              <div className={style['review-drawer__icon-wrapper']}>
                <LuStar className={style['review-drawer__icon']} />
              </div>
              <Drawer.Title className={style['review-drawer__title']}>
                Which item you want to rate
              </Drawer.Title>
            </div>

            <Drawer.Description className={style['review-drawer__description']}>
              You can also rate product on the product page
            </Drawer.Description>

            <div className={style['review-drawer__body']}>
              {isLoading ? (
                <OrderItemSkeleton count={3} />
              ) : orderItems.length === 0 ? (
                <EmptyState
                  icon={<LuStar />}
                  title="Nothing to rate"
                  text="This order has no items left to review."
                />
              ) : (
                orderItems.map((product) => (
                  <ReviewTargetRow key={product.id} item={product} onSelect={onAction} />
                ))
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal container={modalRoot}>
        <Dialog.Overlay className={style['review-modal__overlay']} />
        <Dialog.Content
          className={style['review-modal__content']}
          onPointerDownOutside={ignoreToastInteraction}
        >
          <Dialog.Close asChild>
            <button className={style['review-modal__close-btn']} aria-label="Close">
              <IoClose size={20} />
            </button>
          </Dialog.Close>

          <div className={style['review-modal__header']}>
            <div className={style['review-modal__icon-wrapper']}>
              <LuStar className={style['review-modal__icon']} />
            </div>
            <Dialog.Title className={style['review-modal__title']}>
              Which item you want to rate
            </Dialog.Title>
          </div>

          <Dialog.Description className={style['review-modal__description']}>
            You can also rate product on the product page
          </Dialog.Description>

          <div className={style['review-modal__body']}>
            {isLoading ? (
              <OrderItemSkeleton count={3} />
            ) : orderItems.length === 0 ? (
              <EmptyState
                icon={<LuStar />}
                title="Nothing to rate"
                text="This order has no items left to review."
              />
            ) : (
              orderItems.map((product) => (
                <ReviewTargetRow key={product.id} item={product} onSelect={onAction} />
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
