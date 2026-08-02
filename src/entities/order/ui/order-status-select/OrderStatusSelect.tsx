import type { StatusMeta } from '@/entities/order';

import style from './admin-order-status-select.module.scss';

interface AdminOrderStatusSelectProps<T extends string> {
    label: string;
    value: T;
    options: readonly T[];
    statusMap: Record<string, StatusMeta>;
    onChange: (value: T) => void;
    disabled?: boolean;
}

export function AdminOrderStatusSelect<T extends string>({
    label,
    value,
    options,
    statusMap,
    onChange,
    disabled,
}: AdminOrderStatusSelectProps<T>) {
    const currentLabel = statusMap[value]?.label ?? value;

    return (
        <label className={style['admin-order-status-select']}>
            <span className="sr-only">{label}</span>
            <select
                className={`${style['admin-order-status-select__control']} ${style[`admin-order-status-select__control--${value}`] ?? ''}`}
                data-status={value}
                value={value}
                disabled={disabled}
                // Native <select> never wraps its closed-state text, so at the
                // column widths this row has to work with, a long label
                // ("Awaiting Dispatch") can still end up truncated — title
                // surfaces the full value on hover/long-press as a fallback.
                title={currentLabel}
                onChange={(e) => onChange(e.target.value as T)}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {statusMap[option]?.label ?? option}
                    </option>
                ))}
            </select>
        </label>
    );
}
