import { FC } from 'react';
import style from '../productCard.module.scss';

interface ProductCardBodyProps {
    title: string;
}

export const ProductCardBody: FC<ProductCardBodyProps> = ({ title }) => {
    return (
        <div className={style.card__body}>
            <span className={style.card__title}>{title}</span>
        </div>
    );
};