import { useId } from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

import { getModalRoot } from '@/shared/lib';
import style from './select.module.scss';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    /** `badge` variant only — colors this option's pill via the shared status map. */
    status?: string;
}

export interface SelectProps {
    label: string;
    options: readonly SelectOption[];
    value: string;
    onValueChange: (value: string) => void;
    variant?: 'form' | 'toolbar' | 'badge';
    /** `badge` variant only — shrinks padding/gap to match a compact StatusBadge nearby. */
    compact?: boolean;
    error?: string | boolean;
    description?: string;
    optional?: boolean;
    disabled?: boolean;
    placeholder?: string;
    /** Renders the label visually hidden — e.g. a badge select inside an already-labelled table cell. */
    hideLabel?: boolean;
    title?: string;
    id?: string;
    name?: string;
}

export const Select = ({
    label,
    options,
    value,
    onValueChange,
    variant = 'form',
    compact,
    error,
    description,
    optional,
    disabled,
    placeholder,
    hideLabel,
    title,
    id,
    name,
}: SelectProps) => {
    const generatedId = useId();
    const modalRoot = getModalRoot();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const descriptionId = `${selectId}-description`;
    const isToolbar = variant === 'toolbar';
    const isBadge = variant === 'badge';

    const describedBy = [
        error ? errorId : null,
        !error && description ? descriptionId : null,
    ].filter(Boolean).join(' ') || undefined;

    const selectedOption = options.find((option) => option.value === value);

    const triggerClassName = isBadge
        ? [style.controlBadge, compact ? style.controlBadgeCompact : ''].filter(Boolean).join(' ')
        : [style.control, isToolbar ? style.controlToolbar : '', error ? style.controlError : ''].filter(Boolean).join(' ');

    return (
        <div className={[style.wrapper, isToolbar ? style.wrapperToolbar : '', isBadge ? style.wrapperBadge : ''].filter(Boolean).join(' ')}>
            <label htmlFor={selectId} className={[style.label, hideLabel ? 'sr-only' : ''].filter(Boolean).join(' ')}>
                {label}
                {optional && <span className={style.optionalBadge}>Optional</span>}
            </label>

            <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
                <SelectPrimitive.Trigger
                    id={selectId}
                    className={triggerClassName}
                    data-status={isBadge ? value : undefined}
                    aria-invalid={!!error}
                    aria-describedby={describedBy}
                    title={title}
                >
                    <SelectPrimitive.Value className={isBadge ? style.valueBadge : style.value} placeholder={placeholder}>
                        {selectedOption?.label}
                    </SelectPrimitive.Value>
                    <SelectPrimitive.Icon className={isBadge ? style.chevronBadge : style.chevron}>
                        <LuChevronDown aria-hidden="true" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                <SelectPrimitive.Portal container={modalRoot}>
                    <SelectPrimitive.Content className={style.content} position="popper" sideOffset={6}>
                        <SelectPrimitive.ScrollUpButton className={style.scrollButton}>
                            <LuChevronDown className={style.scrollIconUp} aria-hidden="true" />
                        </SelectPrimitive.ScrollUpButton>

                        <SelectPrimitive.Viewport className={style.viewport}>
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    textValue={option.label}
                                    data-status={isBadge ? (option.status ?? option.value) : undefined}
                                    className={isBadge ? style.itemBadge : style.item}
                                >
                                    <SelectPrimitive.ItemText className={isBadge ? style.itemBadgeLabel : undefined}>
                                        {option.label}
                                    </SelectPrimitive.ItemText>
                                    <SelectPrimitive.ItemIndicator className={isBadge ? style.itemBadgeCheck : style.itemIndicator}>
                                        <LuCheck aria-hidden="true" />
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Viewport>

                        <SelectPrimitive.ScrollDownButton className={style.scrollButton}>
                            <LuChevronDown aria-hidden="true" />
                        </SelectPrimitive.ScrollDownButton>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>

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
};
