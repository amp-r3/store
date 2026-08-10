import {
  AUDIT_ACTIONS,
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_TYPES,
  AUDIT_ENTITY_LABELS,
} from '@/entities/admin';
import { Select, FilterPanel } from '@/shared/ui';

import style from './admin-audit-toolbar.module.scss';

interface AdminAuditToolbarProps {
  action: string;
  entityType: string;
  actorId: string;
  adminOptions: { value: string; label: string }[];
  activeFilterCount: number;
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
  activeFilterCount,
  onActionChange,
  onEntityTypeChange,
  onActorIdChange,
  onResetFilters,
}: AdminAuditToolbarProps) => (
  // Radix Select reserves an empty string value to mean "no selection" —
  // 'all' is the sentinel mapped back to '' at each onValueChange boundary.
  <FilterPanel activeCount={activeFilterCount}>
    <Select
      variant="toolbar"
      label="Action"
      value={action || 'all'}
      options={[
        { value: 'all', label: 'All actions' },
        ...AUDIT_ACTIONS.map((value) => ({ value, label: AUDIT_ACTION_LABELS[value] ?? value })),
      ]}
      onValueChange={(value) => onActionChange(value === 'all' ? '' : value)}
    />

    <Select
      variant="toolbar"
      label="Entity type"
      value={entityType || 'all'}
      options={[
        { value: 'all', label: 'All types' },
        ...AUDIT_ENTITY_TYPES.map((value) => ({
          value,
          label: AUDIT_ENTITY_LABELS[value] ?? value,
        })),
      ]}
      onValueChange={(value) => onEntityTypeChange(value === 'all' ? '' : value)}
    />

    <Select
      variant="toolbar"
      label="Admin"
      value={actorId || 'all'}
      options={[{ value: 'all', label: 'All admins' }, ...adminOptions]}
      onValueChange={(value) => onActorIdChange(value === 'all' ? '' : value)}
    />

    {activeFilterCount > 0 && (
      <button
        type="button"
        className={style['admin-audit-toolbar__reset']}
        onClick={onResetFilters}
      >
        Reset filters
      </button>
    )}
  </FilterPanel>
);
