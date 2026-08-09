import { InputHTMLAttributes, ReactNode, forwardRef, useId, useRef, useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { LuMinus, LuPlus } from "react-icons/lu";
import style from './form-field.module.scss';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | boolean;
  /** Persistent, non-error helper text (e.g. "linked to Google") — unlike `error`, doesn't set `aria-invalid`. */
  description?: string;
  /** Non-blocking advisory (e.g. "Caps Lock is on") — shown alongside error/description, never sets `aria-invalid`. */
  warning?: string;
  optional?: boolean;
  icon?: ReactNode;
  placeholder?: string;
  /** `type="number"` only — a muted unit glyph rendered inline, right of the value (e.g. "%", "kg", "cm"). */
  suffix?: ReactNode;
  /** `type="number"` only — renders −/+ buttons that step the native input and dispatch a real `input` event, so react-hook-form's registered onChange still fires. */
  showStepper?: boolean;
  /**
   * `float` (default) keeps the Material-style label inside the box — right
   * for short forms (auth, checkout). `stacked` renders the label above the
   * control, matching Select/Textarea geometry so mixed rows in a grid
   * align; use it for dense admin data entry.
   */
  labelPlacement?: 'float' | 'stacked';
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, description, warning, id, className, optional, icon, placeholder, suffix, showStepper, type = 'text', labelPlacement = 'float', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;
    const warningId = `${inputId}-warning`;
    const optionalId = `${inputId}-optional`;
    const isStacked = labelPlacement === 'stacked';
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type;

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handleStep = (direction: 1 | -1) => {
      const node = inputRef.current;
      if (!node) return;
      if (direction === 1) node.stepUp();
      else node.stepDown();
      // stepUp/stepDown set .value through the browser's internal algorithm,
      // bypassing the setter React's synthetic event system tracks — a plain
      // dispatched 'input' event is what makes react-hook-form's registered
      // onChange (and any other native input listener) see the new value.
      node.dispatchEvent(new Event('input', { bubbles: true }));
    };

    // `{...props}` is spread onto the input below, so a caller-supplied
    // aria-describedby must be merged here rather than overwritten by it.
    const describedBy = [
      error ? errorId : null,
      !error && description ? descriptionId : null,
      warning ? warningId : null,
      optional ? optionalId : null,
      props['aria-describedby'] ?? null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={style.wrapper}>

        {isStacked && (
          <label htmlFor={inputId} className={style.stackedLabel}>
            {label}
            {optional && <span id={optionalId} className={style.stackedOptional}>Optional</span>}
          </label>
        )}

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

          {showStepper && (
            <button
              type="button"
              className={style.stepperButton}
              tabIndex={-1}
              disabled={props.disabled}
              onClick={() => handleStep(-1)}
              aria-label={`Decrease ${label}`}
            >
              <LuMinus aria-hidden="true" />
            </button>
          )}

          <div className={style.floatGroup}>
            <input
              id={inputId}
              ref={setRefs}
              placeholder={isStacked ? placeholder : ' '}
              className={[
                style.input,
                icon ? style.inputWithIcon : '',
                isStacked ? style.inputStacked : '',
                showStepper ? style.inputCentered : '',
                className || '',
              ].filter(Boolean).join(' ')}
              aria-invalid={!!error}
              type={inputType}
              {...props}
              aria-describedby={describedBy}
            />

            {!isStacked && (
              <label
                htmlFor={inputId}
                className={[
                  style.label,
                  optional ? style.labelOptional : '',
                ].filter(Boolean).join(' ')}
              >
                {label}
              </label>
            )}

            {!isStacked && placeholder && (
              <span className={style.hint} aria-hidden="true">
                {placeholder}
              </span>
            )}
          </div>

          {suffix && (
            <span className={style.suffixSlot} aria-hidden="true">
              {suffix}
            </span>
          )}

          {showStepper && (
            <button
              type="button"
              className={style.stepperButton}
              tabIndex={-1}
              disabled={props.disabled}
              onClick={() => handleStep(1)}
              aria-label={`Increase ${label}`}
            >
              <LuPlus aria-hidden="true" />
            </button>
          )}

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

          {!isStacked && optional && (
            <span id={optionalId} className={style.optionalBadge}>Optional</span>
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

        {warning && (
          <span id={warningId} className={style.warning} role="status">
            {warning}
          </span>
        )}

      </div>
    );
  }
);

FormField.displayName = 'FormField';
