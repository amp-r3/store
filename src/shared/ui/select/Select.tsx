import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import style from './select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string | boolean;
  description?: string;
  optional?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, description, id, className, optional, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const descriptionId = `${selectId}-description`;

    const describedBy = [
      error ? errorId : null,
      !error && description ? descriptionId : null,
      props['aria-describedby'] ?? null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={style.wrapper}>
        <label htmlFor={selectId} className={style.label}>
          {label}
          {optional && <span className={style.optionalBadge}>Optional</span>}
        </label>

        <div className={[style.controlWrapper, error ? style.controlWrapperError : ''].filter(Boolean).join(' ')}>
          <select
            id={selectId}
            ref={ref}
            className={[style.control, className || ''].filter(Boolean).join(' ')}
            aria-invalid={!!error}
            {...props}
            aria-describedby={describedBy}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <IoChevronDown className={style.chevron} aria-hidden="true" />
        </div>

        {typeof error === 'string' && error && (
          <span id={errorId} className={style.error} role="alert">
            {error}
          </span>
        )}

        {!error && description && (
          <span id={descriptionId} className={style.description}>
            {description}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
