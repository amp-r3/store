import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { AdminLowStockItem } from '@/entities/admin';
import { AdminStockInput } from '@/features/admin-product-form';

import style from './admin-low-stock-row.module.scss';

interface AdminLowStockRowProps {
    item: AdminLowStockItem;
}

export const AdminLowStockRow = memo(({ item }: AdminLowStockRowProps) => (
    <article role="listitem" className={style['admin-low-stock-row']}>
        <div className={style['admin-low-stock-row__cell']}>
            <span className={style['admin-low-stock-row__cell-label']}>Product</span>
            {item.thumbnail && (
                <Image
                    className={style['admin-low-stock-row__thumbnail']}
                    src={item.thumbnail}
                    alt=""
                    aria-hidden="true"
                    width={44}
                    height={44}
                />
            )}
            <Link href={`/admin/products/${item.productId}/edit`} className={style['admin-low-stock-row__title']}>
                {item.title}
            </Link>
        </div>

        <div className={style['admin-low-stock-row__cell']}>
            <span className={style['admin-low-stock-row__cell-label']}>Size</span>
            {item.value}
        </div>

        <div className={style['admin-low-stock-row__cell']}>
            <span className={style['admin-low-stock-row__cell-label']}>Stock</span>
            <AdminStockInput
                sizeId={item.sizeId}
                productId={item.productId}
                stock={item.stock}
                ariaLabel={`Stock for ${item.title}, size ${item.value}`}
            />
        </div>
    </article>
));

AdminLowStockRow.displayName = 'AdminLowStockRow';
