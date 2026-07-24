import { useSearchParams } from 'react-router';
import { ProductSize } from '../model/types';

export const useSelectedSize = (sizes?: ProductSize[]) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const rawSizeId = searchParams.get('size');
    const parsedSizeId = rawSizeId ? Number(rawSizeId) : undefined;
    const selectedSizeId = sizes?.some(size => size.id === parsedSizeId) ? parsedSizeId : undefined;

    const setSelectedSizeId = (id: number | undefined) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (id === undefined) {
                next.delete('size');
            } else {
                next.set('size', String(id));
            }
            return next;
        }, { replace: true });
    };

    return { selectedSizeId, setSelectedSizeId };
};
