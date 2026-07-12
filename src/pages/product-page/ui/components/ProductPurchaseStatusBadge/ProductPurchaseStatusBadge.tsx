import { IoCheckmarkCircle } from 'react-icons/io5';
import style from './product-purchase-status-badge.module.scss';
import { useHaptics } from "@/shared/lib/hooks";
import { useAppDispatch } from "@/shared/model";
import { openReviewModal } from "@/features/order-review";

interface PurchaseStatusBadgeProps {
    productId: number;
    purchaseDate: string;
}

export const ProductPurchaseStatusBadge = ({ productId, purchaseDate }: PurchaseStatusBadgeProps) => {
    const dispatch = useAppDispatch();
    const { success } = useHaptics();

    const formattedDate = new Intl.DateTimeFormat('us-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(purchaseDate));

    const handleLeaveFeedback = () => {
        success();
        dispatch(openReviewModal(productId.toString()));
    };

    return (
        <div className={style['purchase-badge']}>
            <div className={style['purchase-badge__content']}>
                <div className={style['purchase-badge__icon-wrapper']}>
                    <IoCheckmarkCircle className={style['purchase-badge__icon']} aria-hidden="true" />
                </div>
                <div className={style['purchase-badge__text']}>
                    <span className={style['purchase-badge__text-title']}>Item purchased</span>
                    <p className={style['purchase-badge__text-desc']}>
                        You bought this product on <strong>{formattedDate}</strong>
                    </p>
                </div>
            </div>
            <button
                className={style['purchase-badge__button']}
                onClick={handleLeaveFeedback}
                type="button"
            >
                Leave feedback
            </button>
        </div>
    );
};
