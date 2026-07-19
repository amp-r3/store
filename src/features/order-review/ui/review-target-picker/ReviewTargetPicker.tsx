import { Dialog } from "radix-ui"
import { Drawer } from "vaul";
import { FC } from "react";
import { IoClose } from "react-icons/io5";
import { LuStar } from 'react-icons/lu';
import { EnrichedOrderItem } from "@/entities/order";
import style from './review-target-picker.module.scss'
import { useMediaQuery } from "@/shared/lib/hooks";
import { OrderItem } from "@/entities/order";
import { OrderItemSkeleton } from "@/entities/order";

interface ReviewTargetPickerProps {
    orderItems: EnrichedOrderItem[]
    onOpenChange(open: boolean): void;
    onAction(item: EnrichedOrderItem): void;
    isLoading: boolean;
    isOpen: boolean;
}

interface ReviewTargetRowProps {
    item: EnrichedOrderItem;
    onSelect(item: EnrichedOrderItem): void;
}

const ReviewTargetRow = ({ item, onSelect }: ReviewTargetRowProps) => (
    <div
        className={style['review-target']}
        role="button"
        tabIndex={0}
        aria-label={`Rate ${item.product.title}`}
        onClick={() => onSelect(item)}
        onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(item);
            }
        }}
    >
        <OrderItem item={item} linkToProduct={false} />
    </div>
);

export const ReviewTargetPicker: FC<ReviewTargetPickerProps> = ({
    orderItems,
    isOpen,
    onOpenChange,
    onAction,
    isLoading,
}) => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (isMobile) {
        return (
            <Drawer.Root open={isOpen} onOpenChange={onOpenChange} direction="bottom">
                <Drawer.Portal container={document.getElementById('modal-root')!}>
                    <Drawer.Overlay className={style['review-drawer__overlay']} />
                    <Drawer.Content className={style['review-drawer__content']} aria-label="Which item you want to rate">
                        <Drawer.Handle className={style['review-drawer__handle']} />
                        
                        <button className={style['review-drawer__close-btn']} aria-label="Close" onClick={() => onOpenChange(false)}>
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
                            ) : (
                                orderItems.map((product) => (
                                    <ReviewTargetRow key={product.id} item={product} onSelect={onAction} />
                                ))
                            )}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        )
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange} >
            <Dialog.Portal container={document.getElementById('modal-root')!}>
                <Dialog.Overlay className={style['review-modal__overlay']} />
                <Dialog.Content className={style['review-modal__content']}>
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
                        ) : (
                            orderItems.map((product) => (
                                <ReviewTargetRow key={product.id} item={product} onSelect={onAction} />
                            ))
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
