import { useCallback, useEffect, useState } from 'react';

/** Second-granularity countdown for resend buttons. The timeout re-arms off
 * `remaining` itself rather than a wall-clock dependency, so it survives
 * re-renders without drifting. */
export const useCooldown = () => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  const start = useCallback((seconds: number) => setRemaining(seconds), []);

  return { remaining, isCoolingDown: remaining > 0, start };
};
