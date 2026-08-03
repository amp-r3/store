import { memo, useState } from 'react';
import { FaStar } from 'react-icons/fa6';
import { LuPencil, LuArchiveRestore, LuArchive, LuBoxes } from 'react-icons/lu';

import { AdminProductListItem } from '@/entities/admin';
import { AdminProductSizesEditor } from '@/features/admin-product-form';
import { formatPrice } from '@/shared/lib';
import { ActionMenu, ActionMenuItem } from '@/shared/ui';

import style from './admin-product-row.module.scss';

interface AdminProductRowProps {
    product: AdminProductListItem;
    onArchive: (product: AdminProductListItem) => void;
    onRestore: (product: AdminProductListItem) => void;
}

export const AdminProductRow = memo(({ product, onArchive, onRestore }: AdminProductRowProps) => {
    const [isStockOpen, setIsStockOpen] = useState(false);

    const actionItems: ActionMenuItem[] = [
        {
            key: 'stock',
            label: isStockOpen ? 'Hide stock' : 'Manage stock',
            icon: <LuBoxes />,
            onSelect: () => setIsStockOpen((open) => !open),
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <LuPencil />,
            to: `/admin/products/${product.id}/edit`,
        },
        product.isArchived
            ? { key: 'restore', label: 'Restore', icon: <LuArchiveRestore />, onSelect: () => onRestore(product) }
            : { key: 'archive', label: 'Archive', icon: <LuArchive />, danger: true, onSelect: () => onArchive(product) },
    ];

    return (
        <article
            role="listitem"
            className={`${style['admin-product-row']} ${product.isArchived ? style['admin-product-row--archived'] : ''}`}
        >
            <div className={style['admin-product-row__cell']}>
                <img
                    className={style['admin-product-row__thumbnail']}
                    src={product.thumbnail ?? undefined}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                />
                <span className={style['admin-product-row__title']}>{product.title}</span>
                {product.isArchived && <span className={style['admin-product-row__archived-badge']}>Archived</span>}
            </div>

            <div className={style['admin-product-row__cell']}>
                <span className={style['admin-product-row__cell-label']}>SKU</span>
                {product.sku || '—'}
            </div>

            <div className={style['admin-product-row__cell']}>
                <span className={style['admin-product-row__cell-label']}>Category</span>
                {product.category || '—'}
            </div>

            <div className={style['admin-product-row__cell']}>
                <span className={style['admin-product-row__cell-label']}>Price</span>
                <span className={style['admin-product-row__price']}>{formatPrice(product.price)}</span>
                {product.discountPercentage > 0 && (
                    <span className={style['admin-product-row__discount']}>
                        -{product.discountPercentage}% from {formatPrice(product.basePrice)}
                    </span>
                )}
            </div>

            <div className={style['admin-product-row__cell']}>
                <span className={style['admin-product-row__cell-label']}>Rating</span>
                <span className={style['admin-product-row__rating']}>
                    <FaStar aria-hidden="true" />
                    {product.rating.toFixed(1)}
                </span>
            </div>

            <div className={style['admin-product-row__actions']}>
                <ActionMenu label={`Actions for ${product.title}`} items={actionItems} />
            </div>

            {isStockOpen && (
                <div className={style['admin-product-row__stock-panel']}>
                    <AdminProductSizesEditor productId={product.id} />
                </div>
            )}
        </article>
    );
});

AdminProductRow.displayName = 'AdminProductRow';
