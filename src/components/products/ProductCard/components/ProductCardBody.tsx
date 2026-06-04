import { FC } from 'react';
import style from '../productCard.module.scss';

interface ProductCardBodyProps {
    title: string;
    stock: number;
}

export const ProductCardBody: FC<ProductCardBodyProps> = ({ title, stock }) => {
    const isLowStock = stock > 0 && stock < 5;
    const isOutOfStock = stock === 0;

    let stockClass = style.card__stock;
    if (isLowStock) stockClass += ` ${style['card__stock--low']}`;
    if (isOutOfStock) stockClass += ` ${style['card__stock--out']}`;

    const stockText = isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${stock} left!` : `${stock} in stock`;

    return (
        <div className={style.card__body}>
            <span className={style.card__title}>{title}</span>
            <span className={stockClass}>{stockText}</span>
        </div>
    );
};