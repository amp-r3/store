import { useLayoutEffect, useState, useCallback } from 'react';

export function useElementWidth<T extends Element>(): {
  ref: (node: T | null) => void;
  width: number;
} {
  // Node lives in state, not a ref: setState from a callback ref is stable
  // by identity, so React calls it only when the node actually mounts or
  // unmounts, giving the effect a truthful dependency. A RefObject can't
  // offer that — ref.current is assigned in the commit phase, after deps
  // are already compared, so a node that mounts after an earlier
  // conditional `return null` is never observed.
  const [node, setNode] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  const ref = useCallback((next: T | null) => {
    setNode(next);
  }, []);

  useLayoutEffect(() => {
    if (!node) return;

    setWidth(node.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { ref, width };
}
