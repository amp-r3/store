import { useDrag, usePinch } from "@use-gesture/react";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import { RefObject, useEffect, useRef } from "react";

interface useImageViewProps {
  isOpen: boolean;
  onClose(): void;
}

interface useImageViewReturn {
  contentRef: RefObject<HTMLDivElement>;
  imageRef: RefObject<HTMLImageElement>;
  bindPinch: (...args: any[]) => ReactDOMAttributes;
  bindDrag: (...args: any[]) => ReactDOMAttributes;
}

export const useImageView = ({isOpen, onClose}: useImageViewProps): useImageViewReturn => {
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasShownSwipeHint = useRef(false);

  const isDragging = useRef(false);
  const isPinching = useRef(false);
  const currentScale = useRef(1);
  const imageOffset = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    if (!isOpen) {
      currentScale.current = 1;
      imageOffset.current = [0, 0];
      isPinching.current = false;
    }
  }, [isOpen]);

  const bindPinch = usePinch(({ offset: [scale], first, last, origin: [ox, oy] }) => {
    if (!imageRef.current) return;

    if (first) {
      isPinching.current = true;
      imageRef.current.style.transition = 'none';

      if (currentScale.current === 1) {
        const rect = imageRef.current.getBoundingClientRect();
        const xPercent = ((ox - rect.left) / rect.width) * 100;
        const yPercent = ((oy - rect.top) / rect.height) * 100;
        imageRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      }
    }

    currentScale.current = scale;
    imageRef.current.style.transform = `translate3d(${imageOffset.current[0]}px, ${imageOffset.current[1]}px, 0) scale(${scale})`;

    if (last) {
      imageRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
      setTimeout(() => { isPinching.current = false; }, 50);
    }
  }, {
    scaleBounds: { min: 1, max: 4 },
    from: () => [currentScale.current, 0] as [number, number],
    modifierKey: null
  });

  const bindDrag = useDrag(({ offset: [ox, oy], movement: [, movementY], velocity: [, velocityY], direction: [, directionY], first, last }) => {
    if (isPinching.current) return;

    if (currentScale.current > 1) {
      if (!imageRef.current) return;
      if (first) imageRef.current.style.transition = 'none';

      imageOffset.current = [ox, oy];
      imageRef.current.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${currentScale.current})`;

      if (last) {
        imageRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
      }
      return;
    }

    if (!contentRef.current) return;

    if (first) {
      isDragging.current = true;
      contentRef.current.style.transition = 'none';
      contentRef.current.dataset.swipeClosing = 'true';
    }

    if (last) {
      isDragging.current = false;
      if (movementY > 120 || (velocityY > 0.5 && directionY > 0)) {
        onClose();
      } else {
        delete contentRef.current.dataset.swipeClosing;
        contentRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        contentRef.current.style.transform = 'translate(-50%, -50%)';
      }
    } else {
      const dragY = movementY > 0 ? movementY : movementY * 0.15;
      contentRef.current.style.transform = `translate(-50%, calc(-50% + ${dragY}px))`;
    }
  }, {
    from: () => (currentScale.current > 1 ? imageOffset.current : [0, 0]) as [number, number],
  });

  useEffect(() => {
    if (isOpen && !hasShownSwipeHint.current) {
      hasShownSwipeHint.current = true;

      let bounceBackTimer: ReturnType<typeof setTimeout>;

      const startHintTimer = setTimeout(() => {
        if (!contentRef.current || isDragging.current) return;

        contentRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        contentRef.current.style.transform = 'translate(-50%, calc(-50% + 20px))';

        bounceBackTimer = setTimeout(() => {
          if (!contentRef.current || isDragging.current) return;
          contentRef.current.style.transform = 'translate(-50%, -50%)';
        }, 300);

      }, 500);

      return () => {
        clearTimeout(startHintTimer);
        clearTimeout(bounceBackTimer);
      };
    }
  }, [isOpen]);

  return { contentRef, imageRef, bindDrag, bindPinch }
}