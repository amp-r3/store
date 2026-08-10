import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseMagneticPointerOptions {
  strength?: number;
  maxOffset?: number;
  approachRadius?: number;
  // Pushes the element away from the cursor instead of pulling it in —
  // for elements sitting next to another magnetic target, where pulling
  // both toward a cursor passing between them reads as them "sticking"
  // together instead of reacting independently.
  repel?: boolean;
}

const DEFAULT_STRENGTH = 0.25;
const DEFAULT_MAX_OFFSET = 10;
const DEFAULT_APPROACH_RADIUS = 90;
const LERP_FACTOR = 0.2;
const SETTLE_EPSILON = 0.05;

export function useMagneticPointer<T extends HTMLElement = HTMLElement>({
  strength = DEFAULT_STRENGTH,
  maxOffset = DEFAULT_MAX_OFFSET,
  approachRadius = DEFAULT_APPROACH_RADIUS,
  repel = false,
}: UseMagneticPointerOptions = {}) {
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = usePrefersReducedMotion();
  const enabled = canHover && !reducedMotion;
  // Two handles on the same DOM node: `node` state only triggers the effect
  // re-run when the ref attaches/detaches; `nodeRef` is the one actually
  // mutated (imperative DOM writes), since react-hooks/immutability forbids
  // writing through a value that came straight out of useState.
  const [node, setNode] = useState<T | null>(null);
  const nodeRef = useRef<T | null>(null);

  const ref = useCallback((el: T | null) => {
    nodeRef.current = el;
    setNode(el);
  }, []);

  useEffect(() => {
    const el = nodeRef.current;

    if (!el || !enabled) {
      return;
    }

    let rect = el.getBoundingClientRect();
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number | null = null;
    let active = false;

    el.dataset.magnet = 'idle';

    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      currentX += dx * LERP_FACTOR;
      currentY += dy * LERP_FACTOR;

      el.style.setProperty('--magnet-x', `${currentX}px`);
      el.style.setProperty('--magnet-y', `${currentY}px`);

      const settled = Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON;
      rafId = settled ? null : requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const threshold = Math.max(rect.width, rect.height) / 2 + approachRadius;

      if (dist < threshold) {
        if (!active) {
          active = true;
          el.dataset.magnet = 'active';
        }

        const direction = repel ? -1 : 1;
        targetX = Math.max(-maxOffset, Math.min(maxOffset, dx * strength * direction));
        targetY = Math.max(-maxOffset, Math.min(maxOffset, dy * strength * direction));

        el.style.setProperty('--sheen-x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--sheen-y', `${e.clientY - rect.top}px`);
        ensureLoop();
      } else if (active) {
        active = false;
        el.dataset.magnet = 'idle';
        targetX = 0;
        targetY = 0;
        ensureLoop();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      el.style.removeProperty('--magnet-x');
      el.style.removeProperty('--magnet-y');
      el.style.removeProperty('--sheen-x');
      el.style.removeProperty('--sheen-y');
      delete el.dataset.magnet;
    };
  }, [node, enabled, strength, maxOffset, approachRadius, repel]);

  return ref;
}
