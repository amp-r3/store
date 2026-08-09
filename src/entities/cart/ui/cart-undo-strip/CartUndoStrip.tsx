import { CSSProperties } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import styles from './cart-undo-strip.module.scss';

interface CartUndoStripProps {
    message: string;
    actionLabel: string;
    onAction: () => void;
    durationMs: number;
}

export const CartUndoStrip = ({ message, actionLabel, onAction, durationMs }: CartUndoStripProps) => {
    return (
        <article className={styles['cart-undo-strip']} aria-live="polite">
            <div className={styles['cart-undo-strip__icon']}>
                <IoTrashOutline aria-hidden="true" />
            </div>

            <p className={styles['cart-undo-strip__message']}>{message}</p>

            <button
                type="button"
                className={styles['cart-undo-strip__action']}
                onClick={onAction}
            >
                {actionLabel}
            </button>

            <div
                className={styles['cart-undo-strip__timer']}
                style={{ '--cart-undo-duration': `${durationMs}ms` } as CSSProperties}
                aria-hidden="true"
            />
        </article>
    );
};
