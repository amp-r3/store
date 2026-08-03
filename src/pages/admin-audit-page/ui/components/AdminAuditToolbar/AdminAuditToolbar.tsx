import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS, AUDIT_ENTITY_TYPES, AUDIT_ENTITY_LABELS } from '@/entities/admin';
import { Select } from '@/shared/ui';

import style from './admin-audit-toolbar.module.scss';

interface AdminAuditToolbarProps {
    action: string;
    entityType: string;
    actorId: string;
    adminOptions: { value: string; label: string }[];
    hasActiveFilter: boolean;
    onActionChange: (action: string) => void;
    onEntityTypeChange: (entityType: string) => void;
    onActorIdChange: (actorId: string) => void;
    onResetFilters: () => void;
}

export const AdminAuditToolbar = ({
    action,
    entityType,
    actorId,
    adminOptions,
    hasActiveFilter,
    onActionChange,
    onEntityTypeChange,
    onActorIdChange,
    onResetFilters,
}: AdminAuditToolbarProps) => (
    <div className={style['admin-audit-toolbar']}>
        <Select
            variant="toolbar"
            label="Action"
            value={action}
            options={[
                { value: '', label: 'All actions' },
                ...AUDIT_ACTIONS.map((value) => ({ value, label: AUDIT_ACTION_LABELS[value] ?? value })),
            ]}
            onChange={(event) => onActionChange(event.target.value)}
        />

        <Select
            variant="toolbar"
            label="Entity type"
            value={entityType}
            options={[
                { value: '', label: 'All types' },
                ...AUDIT_ENTITY_TYPES.map((value) => ({ value, label: AUDIT_ENTITY_LABELS[value] ?? value })),
            ]}
            onChange={(event) => onEntityTypeChange(event.target.value)}
        />

        <Select
            variant="toolbar"
            label="Admin"
            value={actorId}
            options={[{ value: '', label: 'All admins' }, ...adminOptions]}
            onChange={(event) => onActorIdChange(event.target.value)}
        />

        {hasActiveFilter && (
            <button type="button" className={style['admin-audit-toolbar__reset']} onClick={onResetFilters}>
                Reset filters
            </button>
        )}
    </div>
);
