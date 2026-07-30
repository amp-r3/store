import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router';
import { AUTH_STORAGE_KEYS, type AuthProviderId } from '@/shared/config';

export const useAuthUrlError = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
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

    // 3. Parse hash params
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
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
      const attemptedProvider = sessionStorage.getItem(AUTH_STORAGE_KEYS.oauthProvider) as AuthProviderId | null;
      if (attemptedProvider) {
        if (!failedList.includes(attemptedProvider)) {
          const nextFailed = [...failedList, attemptedProvider];
          sessionStorage.setItem(AUTH_STORAGE_KEYS.blockedProviders, JSON.stringify(nextFailed));
          setFailedProviders(nextFailed);
        }
        // Clear the attempted provider as it has been handled
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthProvider);
      }

      // 5. Clean up the URL through the router so useSearchParams doesn't
      // keep returning the stale error on the next render. Preserve
      // location.state (e.g. ProtectedRoute's `from`) — dropping it here
      // would destroy the post-login destination on an OAuth error.
      navigate(location.pathname, { replace: true, state: location.state });
    }
  }, [searchParams, location.hash, location.pathname, location.state, navigate]);

  return { errorMsg, failedProviders };
};
