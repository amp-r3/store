import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import style from './form-field.module.scss';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  optional?: boolean;
  icon?: ReactNode;
  placeholder?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, optional, icon, placeholder, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={style.wrapper}>

        <div className={style.labelRow}>
          <label
            htmlFor={inputId}
            className={`${style.label} ${optional ? style.labelOptional : ''}`}
          >
            {label}
          </label>
          {optional && (
            <span className={style.optionalBadge}>Optional</span>
          )}
        </div>

        <div className={`${style.inputWrapper} ${error ? style.inputWrapperError : ''} ${props.disabled ? style.inputWrapperDisabled : ''}`}>
          {icon && (
            <span className={style.iconSlot} aria-hidden="true">
              {icon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            placeholder={placeholder}
            className={`
              ${style.input}
              ${icon ? style.inputWithIcon : ''}
              ${error ? style.inputError : ''}
              ${optional ? style.inputOptional : ''}
              ${className || ''}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>

        {error && (
          <span id={errorId} className={style.error} role="alert">
            {error}
          </span>
        )}

      </div>
    );
  }
);

FormField.displayName = 'FormField';