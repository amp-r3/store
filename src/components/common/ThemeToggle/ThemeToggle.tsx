import { IoMoon, IoSunny } from 'react-icons/io5';
import { useTheme } from '@/hooks/useTheme';
import style from './theme-toggle.module.scss';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'theme-dark';

  return (
    <button
      type="button"
      className={style.toggle}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Включить золотую тему' : 'Включить темную тему'}
    >
      <span className={style.toggle__icon} data-theme={theme}>
        {isDark ? <IoMoon /> : <IoSunny />}
      </span>
    </button>
  );
};