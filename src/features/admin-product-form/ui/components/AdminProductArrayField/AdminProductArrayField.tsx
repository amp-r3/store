import { Control, UseFormRegister, useFieldArray } from 'react-hook-form';
import { LuPlus, LuX } from 'react-icons/lu';

import style from './admin-product-array-field.module.scss';

// A generic reusable array-of-strings editor bound to whichever parent form
// owns it (images[] / tags[] on the product form) — RHF's Control/register
// types are structurally tied to one exact TFieldValues (down to
// contravariant positions like `_options.validate`), so a component shared
// across two field names on the same form has to widen them to `any` here;
// the parent casts its concrete control/register at the call site.
interface AdminProductArrayFieldProps {
    label: string;
    name: 'images' | 'tags';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: any;
    placeholder: string;
    addLabel: string;
    inputType?: 'text' | 'url';
}

export const AdminProductArrayField = ({ label, name, control, register, errors, placeholder, addLabel, inputType = 'text' }: AdminProductArrayFieldProps) => {
    const { fields, append, remove } = useFieldArray({ control, name });

    return (
        <div className={style.wrapper}>
            <span className={style.label}>{label}</span>

            {fields.length > 0 && (
                <ul className={style.list}>
                    {fields.map((field, index) => (
                        <li key={field.id} className={style.item}>
                            <input
                                className={style.input}
                                type={inputType}
                                placeholder={placeholder}
                                aria-invalid={!!errors?.[index]?.value}
                                {...register(`${name}.${index}.value` as const)}
                            />
                            <button
                                type="button"
                                className={style.remove}
                                onClick={() => remove(index)}
                                aria-label={`Remove ${label.toLowerCase()} item ${index + 1}`}
                            >
                                <LuX />
                            </button>
                            {errors?.[index]?.value && (
                                <span className={style.error} role="alert">{errors[index]?.value?.message}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <button type="button" className={style.add} onClick={() => append({ value: '' })}>
                <LuPlus /> {addLabel}
            </button>
        </div>
    );
};
