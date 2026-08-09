import { createContext, useContext, useEffect } from 'react';

export const AuthCardLoadingContext = createContext<((isLoading: boolean) => void) | null>(null);

/** Reports a busy state up to the enclosing AuthCard's top progress bar.
 *  No-ops when rendered outside an AuthCard. */
export const useAuthCardLoading = (isLoading: boolean) => {
  const setLoading = useContext(AuthCardLoadingContext);

  useEffect(() => {
    if (!setLoading) return;
    setLoading(isLoading);
    return () => setLoading(false);
  }, [setLoading, isLoading]);
};
