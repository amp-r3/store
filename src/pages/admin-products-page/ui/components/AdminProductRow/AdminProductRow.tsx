import { memo } from 'react';
import { FaStar } from 'react-icons/fa6';

import { Product } from '@/entities/product';
import { formatPrice } from '@/shared/lib';

import style from './admin-product-row.module.scss';

interface AdminProductRowProps {
    product: Product;
}

export const AdminProductRow = memo(({ product }: AdminProductRowProps) => (
    <article role="listitem" className={style['admin-product-row']}>
        <div className={style['admin-product-row__cell']}>
            <img
                className={style['admin-product-row__thumbnail']}
                src={product.thumbnail}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
            />
            <span className={style['admin-product-row__title']}>{product.title}</span>
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
                <span className={style['admin-product-row__reviews-count']}>({product.reviewsCount})</span>
            </span>
        </div>
    </article>
));

AdminProductRow.displayName = 'AdminProductRow';
