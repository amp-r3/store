import style from './product-sizes.module.scss';
import { useEffect } from 'react';
import { useHaptics } from "@/shared/lib/hooks";
import { ProductSize } from "@/entities/product";

export interface ProductSizesProps {
    sizes: ProductSize[];
    activeSizeId: number | null | undefined;
    onSizeSelect: (id: number) => void;
    // isCompact удален за ненадобностью
}

export const ProductSizes = ({
    sizes,
    activeSizeId,
    onSizeSelect,
}: ProductSizesProps) => {
    const { light } = useHaptics();

    useEffect(() => {
        if (sizes?.length === 1 && sizes[0].value === 'One Size') {
            if (activeSizeId !== sizes[0].id) {
                onSizeSelect(sizes[0].id);
            }
        }
    }, [sizes, activeSizeId, onSizeSelect]);

    if (!sizes || sizes.length === 0) return null;

    if (sizes.length === 1 && sizes[0].value === 'One Size') {
        return null;
    }

    const handleSelect = (id: number) => {
        light();
        onSizeSelect(id);
    };

    return (
        <div className={style['product-sizes']}>
            <span className={style['product-sizes__title']} aria-hidden="true">
                Select Size
            </span>
            <ul 
                className={style['product-sizes__list']} 
                role="listbox" 
                aria-label="Select product size"
            >
                {sizes.map((size) => {
                    const isActive = size.id === activeSizeId;
                    const isOutOfStock = size.stock === 0;

                    const itemClassName = isActive
                        ? `${style['product-sizes__item']} ${style['product-sizes__item--active']}`
                        : style['product-sizes__item'];

                    return (
                        <li key={size.id} role="option" aria-selected={isActive}>
                            <button
                                type="button"
                                className={itemClassName}
                                onClick={() => handleSelect(size.id)}
                                disabled={isOutOfStock}
                                aria-label={`Size ${size.value}${isOutOfStock ? ', out of stock' : ''}`}
                            >
                                {size.value}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};