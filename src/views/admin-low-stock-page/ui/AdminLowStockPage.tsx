import { useRef } from 'react';
import { LuMinus, LuPackageSearch, LuPlus } from 'react-icons/lu';

import { getErrorMessage } from '@/shared/lib';
import { useUrlState } from '@/shared/lib/hooks';
import { SectionHeader, Alert, EmptyState } from '@/shared/ui';
import { useGetAdminLowStockQuery } from '@/entities/admin';

import { AdminLowStockTable } from './components';
import style from './admin-low-stock-page.module.scss';

const DEFAULT_THRESHOLD = 5;

export const AdminLowStockPage = () => {
  const [searchParams, setSearchParams] = useUrlState();
  const threshold = Number(searchParams.get('threshold')) || DEFAULT_THRESHOLD;
  const thresholdInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useGetAdminLowStockQuery({ threshold });
  const items = data ?? [];

  const handleThresholdChange = (next: number) => {
    setSearchParams(
      (params) => {
        if (next === DEFAULT_THRESHOLD) params.delete('threshold');
        else params.set('threshold', String(next));
        return params;
      },
      { replace: true },
    );
  };

  // The input is controlled by the URL, so a plain stepUp/Down (which
  // mutates the DOM value directly) needs a dispatched 'input' event to
  // route back through onChange — otherwise the next render just reverts it.
  const handleStep = (direction: 1 | -1) => {
    const node = thresholdInputRef.current;
    if (!node) return;
    if (direction === 1) node.stepUp();
    else node.stepDown();
    node.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <>
      <SectionHeader title="Low stock" subtitle="Sizes at or below the threshold, lowest first." />

      <div className={style['admin-low-stock-page__threshold']}>
        {/* Decorative only — the input carries its own aria-label so a
                    screen reader isn't told "Threshold" twice in a row. */}
        <span aria-hidden="true">Threshold</span>
        <div className={style['admin-low-stock-page__threshold-control']}>
          <button
            type="button"
            className={style['admin-low-stock-page__threshold-step']}
            tabIndex={-1}
            onClick={() => handleStep(-1)}
            aria-label="Decrease threshold"
          >
            <LuMinus aria-hidden="true" />
          </button>
          <input
            ref={thresholdInputRef}
            type="number"
            min={0}
            step="1"
            value={threshold}
            onChange={(event) =>
              handleThresholdChange(Math.max(0, Number(event.target.value) || 0))
            }
            className={style['admin-low-stock-page__threshold-input']}
            aria-label="Threshold"
          />
          <button
            type="button"
            className={style['admin-low-stock-page__threshold-step']}
            tabIndex={-1}
            onClick={() => handleStep(1)}
            aria-label="Increase threshold"
          >
            <LuPlus aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon={<LuPackageSearch />}
          title="Stock levels look healthy"
          text={`No size is at or below ${threshold} units right now.`}
        />
      ) : (
        <AdminLowStockTable items={items} isLoading={isLoading} />
      )}
    </>
  );
};
