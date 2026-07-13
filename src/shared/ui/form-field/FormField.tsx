import { InputHTMLAttributes, ReactNode, forwardRef, useId, useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import style from './form-field.module.scss';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | boolean;
  optional?: boolean;
  icon?: ReactNode;
  placeholder?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, optional, icon, placeholder, type = 'text', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
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
              aria-describedby={error ? errorId : undefined}
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

      </div>
    );
  }
);

FormField.displayName = 'FormField';