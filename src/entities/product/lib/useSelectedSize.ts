import { useState } from 'react';
import { ProductSize } from '../model/types';

// Local rather than URL-synced (?size=): useSearchParams() forces the
// product page to bail out to client-side-only rendering during static
// generation for a generateStaticParams route — see ProductPage.tsx's
// isImageOpen for the same reasoning.
export const useSelectedSize = (sizes?: ProductSize[]) => {
    const [rawSelectedSizeId, setSelectedSizeId] = useState<number | undefined>(undefined);
    const selectedSizeId = sizes?.some(size => size.id === rawSelectedSizeId) ? rawSelectedSizeId : undefined;

    return { selectedSizeId, setSelectedSizeId };
};
