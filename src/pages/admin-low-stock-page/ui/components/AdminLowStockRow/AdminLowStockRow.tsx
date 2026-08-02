import { memo } from 'react';
import { Link } from 'react-router';

import { AdminLowStockItem } from '@/entities/admin';
import { AdminStockInput } from '@/features/admin-product-form';

import style from './admin-low-stock-row.module.scss';

interface AdminLowStockRowProps {
    item: AdminLowStockItem;
}

export const AdminLowStockRow = memo(({ item }: AdminLowStockRowProps) => (
    <article role="listitem" className={style['admin-low-stock-row']}>
        <div className={style['admin-low-stock-row__cell']}>
            <img
                className={style['admin-low-stock-row__thumbnail']}
                src={item.thumbnail ?? undefined}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
            />
            <Link to={`/admin/products/${item.productId}/edit`} className={style['admin-low-stock-row__title']}>
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
