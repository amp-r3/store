import { KeyboardEvent, useId, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { LuX } from 'react-icons/lu';

import { useHaptics } from '@/shared/lib';
import { ProductFormInput, ProductFormValues } from '../../../model/productSchema';

import style from './admin-product-tags-field.module.scss';

interface AdminProductTagsFieldProps {
  control: Control<ProductFormInput, unknown, ProductFormValues>;
  error?: string;
}

const COMMIT_KEYS = ['Enter', ','];

export const AdminProductTagsField = ({ control, error }: AdminProductTagsFieldProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const { light } = useHaptics();
  const [draft, setDraft] = useState('');

  const {
    field: { value: tags, onChange },
  } = useController({ control, name: 'tags' });

  const commitDraft = () => {
    const trimmed = draft.trim();
    setDraft('');
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    light();
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
    light();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (COMMIT_KEYS.includes(event.key)) {
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={style.wrapper}>
      <label htmlFor={inputId} className={style.label}>
        Tags
        <span className={style.optionalBadge}>Optional</span>
      </label>

      <div className={[style.control, error ? style.controlError : ''].filter(Boolean).join(' ')}>
        {tags.length > 0 && (
          <ul className={style.chips}>
            {tags.map((tag, index) => (
              <li key={tag} className={style.chip}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  aria-label={`Remove tag ${tag}`}
                >
                  <LuX />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          id={inputId}
          className={style.input}
          type="text"
          value={draft}
          placeholder="e.g. summer"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      {error && (
        <span id={errorId} className={style.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
