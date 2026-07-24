import { useEffect, useState, type RefObject } from 'react';

export function useOnScreen<T extends Element>(
    target: RefObject<T | null>,
    options?: IntersectionObserverInit,
): boolean;
export function useOnScreen(
    target: string,
    options?: IntersectionObserverInit,
    deps?: readonly unknown[],
): boolean;
export function useOnScreen<T extends Element>(
    target: RefObject<T | null> | string,
    options?: IntersectionObserverInit,
    deps: readonly unknown[] = [],
): boolean {
    const [isOnScreen, setIsOnScreen] = useState(true);
    const isElementId = typeof target === 'string';

    useEffect(() => {
        const node = isElementId ? document.getElementById(target) : target.current;
        if (!node) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsOnScreen(entry.isIntersecting);
        }, options);

        observer.observe(node);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, isElementId ? [target, ...deps] : [target.current]);

    return isOnScreen;
}
