import { useEffect, useRef, useState } from 'react';
import { useUrlState } from '@/shared/lib/hooks';
import { AUTH_STORAGE_KEYS, type AuthProviderId } from '@/shared/config';

export const useAuthUrlError = () => {
  const [searchParams, setSearchParams] = useUrlState();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedProviders, setFailedProviders] = useState<AuthProviderId[]>([]);
  const handledRef = useRef(false);

  useEffect(() => {
    // 1. Get providers that have failed before from sessionStorage
    const storedFailed = sessionStorage.getItem(AUTH_STORAGE_KEYS.blockedProviders);
    const failedList: AuthProviderId[] = storedFailed ? JSON.parse(storedFailed) : [];
    setFailedProviders(failedList);

    // 2. Parse search params
    const errorFromSearch = searchParams.get('error');
    const errorDescFromSearch = searchParams.get('error_description');

    // 3. Parse hash params (read once on mount, not tracked reactively —
    // next/navigation has no hash-aware equivalent of react-router's
    // useLocation, but this only ever needs to catch an error already
    // present in the URL when the page loads)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorFromHash = hashParams.get('error');
    const errorDescFromHash = hashParams.get('error_description');

    const hasError = errorFromSearch || errorFromHash;
    const errorDescription = errorDescFromSearch || errorDescFromHash;

    if (hasError && !handledRef.current) {
      handledRef.current = true;

      const decodedMsg = errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'An error occurred during authentication';

      setErrorMsg(decodedMsg);

      // 4. Determine which provider failed
      const attemptedProvider = sessionStorage.getItem(
        AUTH_STORAGE_KEYS.oauthProvider,
      ) as AuthProviderId | null;
      if (attemptedProvider) {
        if (!failedList.includes(attemptedProvider)) {
          const nextFailed = [...failedList, attemptedProvider];
          sessionStorage.setItem(AUTH_STORAGE_KEYS.blockedProviders, JSON.stringify(nextFailed));
          setFailedProviders(nextFailed);
        }
        // Clear the attempted provider as it has been handled
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthProvider);
      }

      // 5. Clean the error out of the URL so useSearchParams doesn't keep
      // returning the stale error on the next render. Every other param is
      // preserved — in particular `?from=`, which now carries the post-login
      // destination that used to live in react-router's location.state.
      // Replacing the URL (no hash in the new string) also drops the hash.
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('error');
          next.delete('error_description');
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  return { errorMsg, failedProviders };
};
