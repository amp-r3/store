import style from './audit-diff.module.scss';

interface AuditDiffProps {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
}

const formatKey = (key: string) => key.replace(/_/g, ' ');

interface ValueProps {
    value: unknown;
    tone: 'before' | 'after';
}

const Value = ({ value, tone }: ValueProps) => {
    const toneClass = tone === 'before' ? style['audit-diff__before'] : style['audit-diff__after'];

    if (value === null || value === undefined) {
        return <span className={toneClass}>—</span>;
    }
    if (typeof value === 'boolean') {
        return <span className={toneClass}>{value ? 'Yes' : 'No'}</span>;
    }
    if (typeof value === 'object') {
        return <pre className={`${style['audit-diff__pre']} ${toneClass}`}>{JSON.stringify(value, null, 2)}</pre>;
    }
    return <span className={toneClass}>{String(value)}</span>;
};

export const AuditDiff = ({ before, after }: AuditDiffProps) => {
    const isCreated = before === null;
    const isDeleted = after === null;

    // created: no prior row, every `after` key is new.
    // deleted: no resulting row, every `before` key is gone.
    // updated: iterate ONLY over after's keys — product.update and the two
    // *_method.update actions log `before` as the full row but `after` as
    // just the partial payload that was actually sent. Diffing by before's
    // keys would render every untouched column as "removed".
    const keys = isCreated
        ? Object.keys(after ?? {})
        : isDeleted
            ? Object.keys(before)
            : Object.keys(after ?? {});

    const rows = keys
        .map((key) => ({ key, beforeValue: before?.[key], afterValue: after?.[key] }))
        .filter((row) => isCreated || isDeleted || row.beforeValue !== row.afterValue);

    if (rows.length === 0) {
        return <p className={style['audit-diff__empty']}>No field changes recorded.</p>;
    }

    return (
        <dl className={style['audit-diff']}>
            {rows.map((row) => (
                <div key={row.key} className={style['audit-diff__row']}>
                    <dt className={style['audit-diff__key']}>{formatKey(row.key)}</dt>
                    <dd className={style['audit-diff__values']}>
                        {!isCreated && <Value value={row.beforeValue} tone="before" />}
                        {!isCreated && !isDeleted && <span className={style['audit-diff__arrow']}>→</span>}
                        {!isDeleted && <Value value={row.afterValue} tone="after" />}
                    </dd>
                </div>
            ))}
        </dl>
    );
};
