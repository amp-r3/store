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

        <div
          className={[
            style.inputWrapper,
            error ? style.inputWrapperError : '',
            props.disabled ? style.inputWrapperDisabled : '',
          ].filter(Boolean).join(' ')}
        >
          {icon && (
            <span className={style.iconSlot} aria-hidden="true">
              {icon}
            </span>
          )}

          <div className={style.floatGroup}>
            <input
              id={inputId}
              ref={ref}
              placeholder=" "
              className={[
                style.input,
                icon ? style.inputWithIcon : '',
                error ? style.inputError : '',
                optional ? style.inputOptional : '',
                className || '',
              ].filter(Boolean).join(' ')}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              {...props}
            />

            <label
              htmlFor={inputId}
              className={[
                style.label,
                optional ? style.labelOptional : '',
              ].filter(Boolean).join(' ')}
            >
              {label}
            </label>

            {placeholder && (
              <span className={style.hint} aria-hidden="true">
                {placeholder}
              </span>
            )}
          </div>

          {optional && (
            <span className={style.optionalBadge}>Optional</span>
          )}
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