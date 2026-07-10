import { Dialog } from "radix-ui"
import { Drawer } from "vaul";
import { FC } from "react";
import { IoClose } from "react-icons/io5";
import { LuStar } from 'react-icons/lu';
import { OrderItem } from "../../../OrderItem/OrderItem";
import { EnrichedOrderItem } from "@/types/order";
import { OrderItemSkeleton } from "../../../OrderItem/OrderItemSkeleton";
import { useMediaQuery } from "@/hooks";
import style from './order-review-modal.module.scss'

interface OrderReviewModalProps {
    orderItems: EnrichedOrderItem[]
    onOpenChange(open: boolean): void;
    onAction(item: EnrichedOrderItem): void;
    onClose(): void;
    isLoading: boolean;
    isOpen: boolean;
}

export const OrderReviewModal: FC<OrderReviewModalProps> = ({
    orderItems,
    isOpen,
    onOpenChange,
    onAction,
    onClose,
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
                                    <div key={product.id} onClick={() => onAction(product)}>
                                        <OrderItem item={product} onClose={onClose} />
                                    </div>
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
                                <div key={product.id} onClick={() => onAction(product)}>
                                    <OrderItem item={product} onClose={onClose} />
                                </div>
                            ))
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
