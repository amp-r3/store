import { InputHTMLAttributes, forwardRef, useId } from "react";
import style from './form-field.module.scss'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  optional?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, optional, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={style.wrapper}>
        <div className={style.labelRow}>
          <label htmlFor={inputId} className={`${style.label} ${optional ? style.labelOptional : ''}`}>
            {label}
          </label>
          {optional && (
            <span className={style.optional}>Optional</span>
          )}
        </div>

        <input
          id={inputId}
          ref={ref}
          className={`${style.input} ${error ? style.inputError : ''} ${optional ? style.inputOptional : ''} ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />

        {error && (
          <span id={errorId} className={style.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'