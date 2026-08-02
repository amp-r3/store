import { useSetAdminStockMutation } from '@/entities/admin';
import style from './admin-stock-input.module.scss';

const LOW_STOCK_THRESHOLD = 5;

interface AdminStockInputProps {
    sizeId: number;
    productId: number;
    stock: number;
    ariaLabel: string;
}

export const AdminStockInput = ({ sizeId, productId, stock, ariaLabel }: AdminStockInputProps) => {
    const [setStock] = useSetAdminStockMutation();

    const handleCommit = (value: string) => {
        const next = Math.max(0, Math.trunc(Number(value) || 0));
        if (next === stock) return;
        setStock({ sizeId, productId, stock: next });
    };

    return (
        <input
            type="number"
            min={0}
            step="1"
            defaultValue={stock}
            // Remounts when an optimistic update lands (or is undone) so the
            // uncontrolled input's displayed value stays in sync.
            key={stock}
            aria-label={ariaLabel}
            className={`${style.input} ${stock === 0 ? style.inputEmpty : stock <= LOW_STOCK_THRESHOLD ? style.inputLow : ''}`}
            onBlur={(event) => handleCommit(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
            }}
        />
    );
};
