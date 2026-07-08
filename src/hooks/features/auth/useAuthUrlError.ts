import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router';

export const useAuthUrlError = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blockedProviders, setBlockedProviders] = useState<string[]>([]);

  useEffect(() => {
    // 1. Get blocked providers from sessionStorage
    const storedBlocked = sessionStorage.getItem('blocked_providers');
    let blockedList: string[] = storedBlocked ? JSON.parse(storedBlocked) : [];
    setBlockedProviders(blockedList);

    // 2. Parse search params
    const errorFromSearch = searchParams.get('error');
    const errorDescFromSearch = searchParams.get('error_description');

    // 3. Parse hash params
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const errorFromHash = hashParams.get('error');
    const errorDescFromHash = hashParams.get('error_description');

    const hasError = errorFromSearch || errorFromHash;
    const errorDescription = errorDescFromSearch || errorDescFromHash;

    if (hasError) {
      const decodedMsg = errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'An error occurred during authentication';

      setErrorMsg(decodedMsg);

      // 4. Determine which provider failed
      const attemptedProvider = sessionStorage.getItem('oauth_provider');
      if (attemptedProvider) {
        if (!blockedList.includes(attemptedProvider)) {
          blockedList = [...blockedList, attemptedProvider];
          sessionStorage.setItem('blocked_providers', JSON.stringify(blockedList));
          setBlockedProviders(blockedList);
        }
        // Clear the attempted provider as it has been handled
        sessionStorage.removeItem('oauth_provider');
      }

      // 5. Clean up URL parameters so refresh doesn't show/re-process the error
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams, location.hash]);

  return { errorMsg, blockedProviders };
};
