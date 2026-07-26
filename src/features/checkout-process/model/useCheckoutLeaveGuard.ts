import { useEffect, useRef, useCallback } from 'react';
import { useBlocker } from 'react-router';

export const useCheckoutLeaveGuard = (isDirty: boolean) => {
  const hasSubmittedRef = useRef(false);

  const markSubmitted = useCallback(() => {
    hasSubmittedRef.current = true;
  }, []);

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && !hasSubmittedRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !hasSubmittedRef.current) {
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return { blocker, markSubmitted };
};
