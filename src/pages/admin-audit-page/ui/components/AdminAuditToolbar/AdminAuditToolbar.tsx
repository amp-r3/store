import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS, AUDIT_ENTITY_TYPES, AUDIT_ENTITY_LABELS } from '@/entities/admin';

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
        <label className={style['admin-audit-toolbar__filter']}>
            <span>Action</span>
            <select value={action} onChange={(event) => onActionChange(event.target.value)}>
                <option value="">All actions</option>
                {AUDIT_ACTIONS.map((value) => (
                    <option key={value} value={value}>{AUDIT_ACTION_LABELS[value] ?? value}</option>
                ))}
            </select>
        </label>

        <label className={style['admin-audit-toolbar__filter']}>
            <span>Entity type</span>
            <select value={entityType} onChange={(event) => onEntityTypeChange(event.target.value)}>
                <option value="">All types</option>
                {AUDIT_ENTITY_TYPES.map((value) => (
                    <option key={value} value={value}>{AUDIT_ENTITY_LABELS[value] ?? value}</option>
                ))}
            </select>
        </label>

        <label className={style['admin-audit-toolbar__filter']}>
            <span>Admin</span>
            <select value={actorId} onChange={(event) => onActorIdChange(event.target.value)}>
                <option value="">All admins</option>
                {adminOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>

        {hasActiveFilter && (
            <button type="button" className={style['admin-audit-toolbar__reset']} onClick={onResetFilters}>
                Reset filters
            </button>
        )}
    </div>
);
