import { IoChevronDown } from 'react-icons/io5';

import type { StatusMeta } from '@/entities/order';

import style from './order-status-select.module.scss';

interface OrderStatusSelectProps<T extends string> {
    label: string;
    value: T;
    options: readonly T[];
    statusMap: Record<string, StatusMeta>;
    onChange: (value: T) => void;
    disabled?: boolean;
    /**
     * Legal target values from the current one, per the DB transition matrix.
     * `undefined` = matrix still loading/errored — leave every option enabled
     * rather than lock the admin out on a transient fetch failure (the server
     * still validates regardless). `[]` = current value is terminal.
     */
    allowedValues?: readonly T[];
}

export function OrderStatusSelect<T extends string>({
    label,
    value,
    options,
    statusMap,
    onChange,
    disabled,
    allowedValues,
}: OrderStatusSelectProps<T>) {
    const currentLabel = statusMap[value]?.label ?? value;
    const isTerminal = allowedValues !== undefined && allowedValues.length === 0;
    const controlTitle = isTerminal ? `${currentLabel} is a final status` : currentLabel;

    return (
        <label className={style['order-status-select']}>
            <span className="sr-only">{label}</span>
            <select
                className={`${style['order-status-select__control']} ${style[`order-status-select__control--${value}`] ?? ''}`}
                data-status={value}
                value={value}
                disabled={disabled || isTerminal}
                // Native <select> never wraps its closed-state text, so at the
                // column widths this row has to work with, a long label
                // ("Awaiting Dispatch") can still end up truncated — title
                // surfaces the full value on hover/long-press as a fallback.
                title={controlTitle}
                onChange={(e) => onChange(e.target.value as T)}
            >
                {options.map((option) => {
                    const isAllowed = option === value || allowedValues === undefined || allowedValues.includes(option);
                    return (
                        <option key={option} value={option} disabled={!isAllowed}>
                            {statusMap[option]?.label ?? option}
                        </option>
                    );
                })}
            </select>
            <IoChevronDown className={style['order-status-select__chevron']} aria-hidden="true" />
            {isTerminal && (
                <span className="sr-only">{currentLabel} is a final status and cannot be changed.</span>
            )}
        </label>
    );
}
