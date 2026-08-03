import { memo } from 'react';

import { ExpandableContent } from '@/shared/ui';
import { formatDate } from '@/shared/lib';

import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from '../../config/auditVocabulary';
import { AdminAuditEntry } from '../../api/adminAuditApi';
import { AuditDiff } from '../audit-diff/AuditDiff';
import style from './audit-log-row.module.scss';

interface AuditLogRowProps {
    entry: AdminAuditEntry;
}

export const AuditLogRow = memo(({ entry }: AuditLogRowProps) => {
    const actionLabel = AUDIT_ACTION_LABELS[entry.action] ?? entry.action;
    const entityLabel = AUDIT_ENTITY_LABELS[entry.entityType] ?? entry.entityType;

    return (
        <article role="listitem" className={style['audit-log-row']}>
            <div className={style['audit-log-row__header']}>
                <span className={style['audit-log-row__actor']}>{entry.actorUsername}</span>
                <span className={style['audit-log-row__action']}>{actionLabel}</span>
                <span className={style['audit-log-row__entity-chip']}>{entityLabel}</span>
                <time className={style['audit-log-row__date']} dateTime={entry.createdAt}>
                    {formatDate(entry.createdAt, 'full')}
                </time>
            </div>

            <ExpandableContent maxHeight={120}>
                <AuditDiff before={entry.before} after={entry.after} />
            </ExpandableContent>
        </article>
    );
});

AuditLogRow.displayName = 'AuditLogRow';
