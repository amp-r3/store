import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUrlState, useTransitionRouter } from '@/shared/lib/hooks';

export function useSearch() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const isCatalogPage = pathname === '/catalog';
  const [searchParams, setSearchParams] = useUrlState();

  const queryFromUrl = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(queryFromUrl);

  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  // Read via a ref, not a reactive dependency — an unrelated URL change
  // (sort/category/page while the user is still typing) would otherwise
  // restart this 300ms timer on every keystroke's debounce window.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    if (!isCatalogPage) return;

    const trimmedQuery = inputValue.trim();

    if (trimmedQuery === queryFromUrl) return;

    const timerId = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current);

      if (trimmedQuery) {
        params.set('q', trimmedQuery);
      } else {
        params.delete('q');
      }

      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timerId);
  }, [inputValue, queryFromUrl, setSearchParams, isCatalogPage]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');

    if (!isCatalogPage) return;

    const params = new URLSearchParams(searchParams);
    params.delete('q');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams, isCatalogPage]);

  const submitSearch = useCallback(() => {
    if (isCatalogPage) return;

    const trimmedQuery = inputValue.trim();
    if (!trimmedQuery) return;

    router.push(`/catalog?q=${encodeURIComponent(trimmedQuery)}`);
  }, [isCatalogPage, inputValue, router]);

  return {
    inputValue,
    handleSearch,
    handleClear,
    submitSearch,
    isCatalogPage,
  };
}
