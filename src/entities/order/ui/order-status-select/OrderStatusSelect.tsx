import type { StatusMeta } from '@/entities/order';
import { Select } from '@/shared/ui';

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
    /** Matches a compact StatusBadge sitting in the same dense row (e.g. AdminOrderRow). */
    compact?: boolean;
}

export function OrderStatusSelect<T extends string>({
    label,
    value,
    options,
    statusMap,
    onChange,
    disabled,
    allowedValues,
    compact,
}: OrderStatusSelectProps<T>) {
    const currentLabel = statusMap[value]?.label ?? value;
    const isTerminal = allowedValues !== undefined && allowedValues.length === 0;
    const controlTitle = isTerminal ? `${currentLabel} is a final status` : currentLabel;

    const selectOptions = options.map((option) => ({
        value: option,
        label: statusMap[option]?.label ?? option,
        status: option,
        disabled: !(option === value || allowedValues === undefined || allowedValues.includes(option)),
    }));

    return (
        <>
            <Select
                variant="badge"
                compact={compact}
                hideLabel
                label={label}
                value={value}
                options={selectOptions}
                onValueChange={(next) => onChange(next as T)}
                disabled={disabled || isTerminal}
                title={controlTitle}
            />
            {isTerminal && (
                <span className="sr-only">{currentLabel} is a final status and cannot be changed.</span>
            )}
        </>
    );
}
