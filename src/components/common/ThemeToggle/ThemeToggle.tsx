import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useTheme, useHaptics } from '@/hooks';
import style from './theme-toggle.module.scss';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch';
}

export const ThemeToggle = ({ variant = 'icon' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const { soft } = useHaptics();

  const isDark = theme === 'theme-dark';

  const handleToggle = () => {
    toggleTheme();
    soft();
  };

  // Версия 2: Плоский премиальный тумблер (Switch)
  if (variant === 'switch') {
    return (
      <button
        type="button"
        className={`${style.switch} ${isDark ? style['switch--dark'] : style['switch--light']}`}
        onClick={handleToggle}
        aria-label="Toggle theme"
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <span className={style.switch__track}>
          <span className={style.switch__indicator}>
            <RiMoonLine className={`${style.switch__icon} ${style['switch__icon--moon']}`} />
            <RiSunLine className={`${style.switch__icon} ${style['switch__icon--sun']}`} />
          </span>
        </span>
      </button>
    );
  }

  // Версия 1: Большая круглая кнопка (Icon - без изменений)
  return (
    <button
      type="button"
      className={style.toggle}
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={isDark ? 'Toggle light theme' : 'Toggle dark theme'}
    >
      <span className={style.toggle__icon} data-theme={theme}>
        {isDark ? <RiMoonLine /> : <RiSunLine />}
      </span>
    </button>
  );
};