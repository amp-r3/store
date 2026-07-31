import { useLayoutEffect, useState, type RefObject } from 'react';

export function useElementWidth<T extends Element>(target: RefObject<T | null>): number {
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        const node = target.current;
        if (!node) return;

        setWidth(node.getBoundingClientRect().width);

        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
        });

        observer.observe(node);
        return () => observer.disconnect();
        // target.current, not target: the ref object itself is stable across
        // renders, so an effect keyed on it would never re-fire when a
        // conditionally-rendered node (e.g. Pagination returning null while
        // hidden) later mounts on the same component instance.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target.current]);

    return width;
}
