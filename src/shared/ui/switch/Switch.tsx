import { useId } from 'react';
import { useHaptics } from '@/shared/lib/hooks';
import style from './switch.module.scss';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Switch = ({ checked, onChange, label, disabled }: SwitchProps) => {
  const { light } = useHaptics();
  const id = useId();

  const handleClick = () => {
    light();
    onChange(!checked);
  };

  return (
    <label htmlFor={id} className={style.wrapper}>
      <span className={style.label}>{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`${style.track} ${checked ? style.trackChecked : ''}`}
        onClick={handleClick}
      >
        <span className={style.thumb} />
      </button>
    </label>
  );
};
