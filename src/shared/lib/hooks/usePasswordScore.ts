import { useEffect, useState } from 'react';
import { getPasswordScoreAsync } from '../passwordRules';

/** zxcvbn score (0–4) for the given password, loaded on demand — see
 * passwordRules.ts. Starts at 0 and updates once the dynamic import plus
 * scoring resolves; a stale in-flight result for a password the user has
 * since changed is discarded. */
export function usePasswordScore(password: string): number {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setScore(0);
      return;
    }

    let cancelled = false;
    getPasswordScoreAsync(password).then((resolvedScore) => {
      if (!cancelled) setScore(resolvedScore);
    });

    return () => {
      cancelled = true;
    };
  }, [password]);

  return score;
}
