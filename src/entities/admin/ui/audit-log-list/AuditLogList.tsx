import { AdminAuditEntry } from '../../api/adminAuditApi';
import { AuditLogRow } from '../audit-log-row/AuditLogRow';
import { AuditLogRowSkeleton } from '../audit-log-row/AuditLogRowSkeleton';
import style from './audit-log-list.module.scss';

interface AuditLogListProps {
  entries: AdminAuditEntry[];
  isLoading: boolean;
  limit: number;
  /** Tighter row spacing for the narrower customer-details-drawer embed. */
  compact?: boolean;
}

export const AuditLogList = ({ entries, isLoading, limit, compact = false }: AuditLogListProps) => (
  <div
    className={`${style['audit-log-list']} ${compact ? style['audit-log-list--compact'] : ''}`}
    role="list"
  >
    {isLoading ? (
      <AuditLogRowSkeleton count={limit} />
    ) : (
      entries.map((entry) => <AuditLogRow key={entry.id} entry={entry} />)
    )}
  </div>
);
