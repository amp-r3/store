import { InputHTMLAttributes, ReactNode, forwardRef, useId, useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import style from './form-field.module.scss';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | boolean;
  /** Persistent, non-error helper text (e.g. "linked to Google") — unlike `error`, doesn't set `aria-invalid`. */
  description?: string;
  optional?: boolean;
  icon?: ReactNode;
  placeholder?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, description, id, className, optional, icon, placeholder, type = 'text', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type;

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
              aria-describedby={error ? errorId : description ? descriptionId : undefined}
              type={inputType}
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

          {isPasswordType && (
            <button
              type="button"
              className={style.passwordToggle}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          )}

          {optional && (
            <span className={style.optionalBadge}>Optional</span>
          )}
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

FormField.displayName = 'FormField';