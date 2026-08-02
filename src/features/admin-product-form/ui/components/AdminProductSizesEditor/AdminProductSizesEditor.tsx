import { FormEvent, useState } from 'react';
import { LuTrash2, LuPlus } from 'react-icons/lu';

import { FormField, Button, Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import {
    AdminProductSize,
    useGetAdminProductSizesQuery,
    useUpsertAdminProductSizeMutation,
    useDeleteAdminProductSizeMutation,
    useSetAdminStockMutation,
} from '@/entities/admin';

import style from './admin-product-sizes-editor.module.scss';

const LOW_STOCK_THRESHOLD = 5;

interface AdminProductSizesEditorProps {
    productId: number;
}

export const AdminProductSizesEditor = ({ productId }: AdminProductSizesEditorProps) => {
    const { data: sizes, isLoading } = useGetAdminProductSizesQuery(productId);
    const [upsertSize, { isLoading: isAdding }] = useUpsertAdminProductSizeMutation();
    const [setStock] = useSetAdminStockMutation();
    const [deleteSize, { isLoading: isDeleting }] = useDeleteAdminProductSizeMutation();

    const [newValue, setNewValue] = useState('');
    const [newStock, setNewStock] = useState('0');
    const [addError, setAddError] = useState<string | null>(null);

    const [deletingSize, setDeletingSize] = useState<AdminProductSize | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleAdd = async (event: FormEvent) => {
        event.preventDefault();
        if (!newValue.trim()) return;

        setAddError(null);
        try {
            await upsertSize({ productId, value: newValue.trim(), stock: Math.max(0, Number(newStock) || 0) }).unwrap();
            setNewValue('');
            setNewStock('0');
        } catch (err) {
            setAddError(getErrorMessage(err));
        }
    };

    const handleStockCommit = (sizeId: number, value: string) => {
        const stock = Math.max(0, Math.trunc(Number(value) || 0));
        setStock({ sizeId, productId, stock });
    };

    const handleDeleteConfirm = async () => {
        if (!deletingSize) return;

        setDeleteError(null);
        try {
            await deleteSize({ sizeId: deletingSize.id, productId }).unwrap();
            setDeletingSize(null);
        } catch (err) {
            const message = getErrorMessage(err);
            setDeleteError(
                message.includes('order_items_size_id_fkey')
                    ? 'This size has already been ordered and can\'t be deleted.'
                    : message
            );
        }
    };

    return (
        <div className={style.wrapper}>
            {!isLoading && sizes && sizes.length > 0 && (
                <ul className={style.list}>
                    {sizes.map((size) => (
                        <li key={size.id} className={style.item}>
                            <span className={style.value}>{size.value}</span>
                            <input
                                type="number"
                                min={0}
                                step="1"
                                className={`${style.stockInput} ${size.stock === 0 ? style.stockInputEmpty : size.stock <= LOW_STOCK_THRESHOLD ? style.stockInputLow : ''}`}
                                defaultValue={size.stock}
                                key={size.stock}
                                aria-label={`Stock for size ${size.value}`}
                                onBlur={(event) => handleStockCommit(size.id, event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') event.currentTarget.blur();
                                }}
                            />
                            <button
                                type="button"
                                className={style.remove}
                                onClick={() => { setDeleteError(null); setDeletingSize(size); }}
                                aria-label={`Remove size ${size.value}`}
                            >
                                <LuTrash2 />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && (!sizes || sizes.length === 0) && (
                <p className={style.empty}>No sizes yet.</p>
            )}

            {addError && <Alert variant="error">{addError}</Alert>}

            <form className={style.addForm} onSubmit={handleAdd}>
                <FormField
                    label="Size"
                    value={newValue}
                    onChange={(event) => setNewValue(event.target.value)}
                />
                <FormField
                    label="Stock"
                    type="number"
                    min={0}
                    step="1"
                    value={newStock}
                    onChange={(event) => setNewStock(event.target.value)}
                />
                <Button type="submit" variant="ghost" isLoading={isAdding}>
                    <LuPlus /> Add size
                </Button>
            </form>

            <Modal
                isOpen={!!deletingSize}
                onOpenChange={(open) => { if (!open) setDeletingSize(null); }}
                title={`Remove size "${deletingSize?.value ?? ''}"?`}
                actionLabel="Remove"
                actionVariant="danger"
                onAction={handleDeleteConfirm}
                isLoading={isDeleting}
            >
                {!!deleteError && <Alert variant="error">{deleteError}</Alert>}
            </Modal>
        </div>
    );
};
