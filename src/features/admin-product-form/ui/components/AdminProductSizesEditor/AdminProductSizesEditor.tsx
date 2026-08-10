import { KeyboardEvent, useState } from 'react';
import { LuTrash2, LuPlus } from 'react-icons/lu';

import { FormField, Button, Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import {
  AdminProductSize,
  useGetAdminProductSizesQuery,
  useUpsertAdminProductSizeMutation,
  useDeleteAdminProductSizeMutation,
} from '@/entities/admin';

import { AdminStockInput } from '../AdminStockInput/AdminStockInput';
import style from './admin-product-sizes-editor.module.scss';

interface AdminProductSizesEditorProps {
  productId: number;
}

export const AdminProductSizesEditor = ({ productId }: AdminProductSizesEditorProps) => {
  const { data: sizes, isLoading } = useGetAdminProductSizesQuery(productId);
  const [upsertSize, { isLoading: isAdding }] = useUpsertAdminProductSizeMutation();
  const [deleteSize, { isLoading: isDeleting }] = useDeleteAdminProductSizeMutation();

  const [newValue, setNewValue] = useState('');
  const [newStock, setNewStock] = useState('0');
  const [addError, setAddError] = useState<string | null>(null);

  const [deletingSize, setDeletingSize] = useState<AdminProductSize | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newValue.trim()) return;

    setAddError(null);
    try {
      await upsertSize({
        productId,
        value: newValue.trim(),
        stock: Math.max(0, Number(newStock) || 0),
      }).unwrap();
      setNewValue('');
      setNewStock('0');
    } catch (err) {
      setAddError(getErrorMessage(err));
    }
  };

  // The product form this editor lives inside is already a <form> — a second,
  // nested <form> here is invalid HTML and triggers a hydration mismatch, so
  // "Enter submits" is wired manually instead of relying on native form submit.
  const handleSizeInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
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
          ? "This size has already been ordered and can't be deleted."
          : message,
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
              <AdminStockInput
                sizeId={size.id}
                productId={productId}
                stock={size.stock}
                ariaLabel={`Stock for size ${size.value}`}
              />
              <button
                type="button"
                className={style.remove}
                onClick={() => {
                  setDeleteError(null);
                  setDeletingSize(size);
                }}
                aria-label={`Remove size ${size.value}`}
              >
                <LuTrash2 />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && (!sizes || sizes.length === 0) && <p className={style.empty}>No sizes yet.</p>}

      {addError && <Alert variant="error">{addError}</Alert>}

      <div className={style.addForm}>
        <FormField
          label="Size"
          labelPlacement="stacked"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          onKeyDown={handleSizeInputKeyDown}
        />
        <FormField
          label="Stock"
          labelPlacement="stacked"
          showStepper
          type="number"
          min={0}
          step="1"
          value={newStock}
          onChange={(event) => setNewStock(event.target.value)}
          onKeyDown={handleSizeInputKeyDown}
        />
        <Button type="button" variant="ghost" isLoading={isAdding} onClick={handleAdd}>
          <LuPlus /> Add size
        </Button>
      </div>

      <Modal
        isOpen={!!deletingSize}
        onOpenChange={(open) => {
          if (!open) setDeletingSize(null);
        }}
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
