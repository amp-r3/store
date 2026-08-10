import { useEffect, useRef } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const LERP_FACTOR = 0.12;
const SETTLE_EPSILON = 0.1;
const LIT_EPSILON = 0.01;

export function usePointerSpotlight<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = usePrefersReducedMotion();
  const enabled = canHover && !reducedMotion;

  useEffect(() => {
    const el = ref.current;

    if (!el || !enabled) {
      return;
    }

    let rect = el.getBoundingClientRect();
    let targetX = rect.width / 2;
    let targetY = rect.height / 2;
    let currentX = targetX;
    let currentY = targetY;
    let targetLit = 0;
    let currentLit = 0;
    let rafId: number | null = null;

    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    const writeVars = () => {
      el.style.setProperty('--hero-px', `${currentX}px`);
      el.style.setProperty('--hero-py', `${currentY}px`);
      el.style.setProperty('--hero-nx', `${(currentX / rect.width) * 2 - 1}`);
      el.style.setProperty('--hero-ny', `${(currentY / rect.height) * 2 - 1}`);
      el.style.setProperty('--hero-lit', `${currentLit}`);
    };

    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const dLit = targetLit - currentLit;

      currentX += dx * LERP_FACTOR;
      currentY += dy * LERP_FACTOR;
      currentLit += dLit * LERP_FACTOR;

      writeVars();

      const settled =
        Math.abs(dx) < SETTLE_EPSILON &&
        Math.abs(dy) < SETTLE_EPSILON &&
        Math.abs(dLit) < LIT_EPSILON;

      rafId = settled ? null : requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      ensureLoop();
    };

    const handlePointerEnter = () => {
      targetLit = 1;
      ensureLoop();
    };

    const handlePointerLeave = () => {
      targetLit = 0;
      ensureLoop();
    };

    el.addEventListener('pointermove', handlePointerMove, { passive: true });
    el.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    el.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerenter', handlePointerEnter);
      el.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      el.style.removeProperty('--hero-px');
      el.style.removeProperty('--hero-py');
      el.style.removeProperty('--hero-nx');
      el.style.removeProperty('--hero-ny');
      el.style.removeProperty('--hero-lit');
    };
  }, [enabled]);

  return { ref };
}
