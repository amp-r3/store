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

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
    }).format(new Date(purchaseDate));

    const handleLeaveFeedback = () => {
        success();
        dispatch(openReviewModal(productId.toString()));
    };

    return (
        <div className={style['badge']}>
            <div className={style['badge-content']}>
                <div className={style['badge-icon-wrapper']}>
                    <IoCheckmarkCircle className={style['badge-icon']} aria-hidden="true" />
                </div>
                <div className={style['badge-text']}>
                    <span className={style['badge-text-title']}>Item purchased</span>
                    <p className={style['badge-text-desc']}>
                        You bought this on <strong>{formattedDate}</strong>
                    </p>
                </div>
            </div>
            <button
                className={style['badge-button']}
                onClick={handleLeaveFeedback}
                type="button"
                aria-label="Leave feedback for this purchased item"
            >
                Leave feedback
            </button>
        </div>
    );
};