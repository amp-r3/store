import { useAppDispatch, useHaptics } from '@/hooks';
import { openReviewModal } from '@/store';
import style from './purchase-status-badge.module.scss';

interface PurchaseStatusBadgeProps {
    productId: number;
    purchaseDate: string;
}

export const PurchaseStatusBadge = ({ productId, purchaseDate }: PurchaseStatusBadgeProps) => {
    const dispatch = useAppDispatch();
    const { success } = useHaptics();

    const formattedDate = new Intl.DateTimeFormat('ru-RU', {
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
                <span className={style['purchase-badge__icon']} aria-hidden="true">✔</span>
                <p className={style['purchase-badge__text']}>
                    You have already purchased this product on <strong>{formattedDate}</strong>
                </p>
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
