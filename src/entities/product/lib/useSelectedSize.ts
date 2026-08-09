import { useCallback, useSyncExternalStore } from 'react';
import { ProductSize } from '../model/types';

// Local rather than URL-synced (?size=): useSearchParams() forces the
// product page to bail out to client-side-only rendering during static
// generation for a generateStaticParams route — see ProductPage.tsx's
// isImageOpen for the same reasoning.
// Module-level rather than component state: ProductPage's size selector and
// MobileBar's purchase bar are siblings under MainLayout (not parent/child),
// so component-local state left MobileBar unable to see a size picked on the
// page — it kept prompting "Select Size" even after one was chosen.
let rawSelectedSizeId: number | undefined;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => rawSelectedSizeId;
const getServerSnapshot = () => undefined;

export const useSelectedSize = (sizes?: ProductSize[]) => {
    const rawId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const selectedSizeId = sizes?.some(size => size.id === rawId) ? rawId : undefined;

    const setSelectedSizeId = useCallback((id: number | undefined) => {
        rawSelectedSizeId = id;
        listeners.forEach(listener => listener());
    }, []);

    return { selectedSizeId, setSelectedSizeId };
};
