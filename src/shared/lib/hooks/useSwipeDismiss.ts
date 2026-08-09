import { useDrag } from "@use-gesture/react";
import { RefObject, useRef } from "react";

interface UseSwipeDismissProps {
  direction: 'up' | 'down';
  onDismiss(): void;
  disabled?: boolean;
}

interface UseSwipeDismissReturn {
  ref: RefObject<HTMLElement | null>;
  bind: ReturnType<typeof useDrag>;
}

// Same threshold/rubber-band idiom as useImageView's swipe-to-close.
const DISMISS_DISTANCE = 60;
const DISMISS_VELOCITY = 0.5;

export const useSwipeDismiss = ({ direction, onDismiss, disabled }: UseSwipeDismissProps): UseSwipeDismissReturn => {
  const ref = useRef<HTMLElement>(null);
  const sign = direction === 'up' ? -1 : 1;

  const bind = useDrag(({ movement: [, movementY], velocity: [, velocityY], direction: [, directionY], first, last }) => {
    if (disabled || !ref.current) return;

    if (first) {
      ref.current.style.transition = 'none';
    }

    if (last) {
      const committed = sign * movementY > DISMISS_DISTANCE || (velocityY > DISMISS_VELOCITY && sign * directionY > 0);

      ref.current.style.transition = `transform ${300}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${300}ms cubic-bezier(0.25, 1, 0.5, 1)`;

      if (committed) {
        ref.current.style.transform = `translateY(${sign * 100}%)`;
        ref.current.style.opacity = '0';
        onDismiss();
      } else {
        ref.current.style.transform = 'translateY(0)';
      }
      return;
    }

    const dragY = sign * movementY > 0 ? movementY : movementY * 0.15;
    ref.current.style.transform = `translateY(${dragY}px)`;
  }, {
    axis: 'y',
    from: () => [0, 0] as [number, number],
  });

  return { ref, bind };
};
