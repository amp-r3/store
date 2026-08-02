import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import style from './textarea.module.scss';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | boolean;
  description?: string;
  optional?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, description, id, className, optional, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const descriptionId = `${textareaId}-description`;

    const describedBy = [
      error ? errorId : null,
      !error && description ? descriptionId : null,
      props['aria-describedby'] ?? null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={style.wrapper}>
        <label htmlFor={textareaId} className={style.label}>
          {label}
          {optional && <span className={style.optionalBadge}>Optional</span>}
        </label>

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={[style.control, error ? style.controlError : '', className || ''].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          {...props}
          aria-describedby={describedBy}
        />

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

Textarea.displayName = 'Textarea';
