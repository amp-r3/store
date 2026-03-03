import { RiMoonLine, RiSunLine } from "react-icons/ri";
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
      title={isDark ? 'toggle light theme' : 'toggle dark theme'}
    >
      <span className={style.toggle__icon} data-theme={theme}>
        {isDark ? <RiMoonLine /> : <RiSunLine />}
      </span>
    </button>
  );
};