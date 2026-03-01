import { selectTheme, setTheme, ThemeType, toggleTheme } from '@/store/slices/themeSlice';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';


export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('theme-dark', 'theme-light');
    
    root.classList.add(theme);

    return () => {
      root.classList.remove(theme);
    };
  }, [theme]);

  return {
    theme,
    setTheme: (newTheme: ThemeType) => dispatch(setTheme(newTheme)),
    toggleTheme: () => dispatch(toggleTheme()),
  };
};