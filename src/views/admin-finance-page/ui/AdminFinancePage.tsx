import { useUrlState } from '@/shared/lib/hooks';

import { SectionHeader, SegmentedTabs, type SegmentedTabItem } from '@/shared/ui';

import {
  AdminFinanceKpi,
  AdminMoneyFlowPanel,
  AdminFinanceTrendPanel,
  AdminPaymentMethodsPanel,
  AdminDeliveryPanel,
  AdminFinanceTable,
} from './components';
import style from './admin-finance-page.module.scss';

type FinanceRange = '7' | '30' | '90';
type FinanceView = 'charts' | 'numbers';

const RANGE_ITEMS: SegmentedTabItem<FinanceRange>[] = [
  { id: '7', label: '7d' },
  { id: '30', label: '30d' },
  { id: '90', label: '90d' },
];

const VIEW_ITEMS: SegmentedTabItem<FinanceView>[] = [
  { id: 'charts', label: 'Charts' },
  { id: 'numbers', label: 'Numbers' },
];

const isFinanceRange = (value: string | null): value is FinanceRange =>
  value === '7' || value === '30' || value === '90';
const isFinanceView = (value: string | null): value is FinanceView =>
  value === 'charts' || value === 'numbers';

export const AdminFinancePage = () => {
  const [searchParams, setSearchParams] = useUrlState();

  const rangeParam = searchParams.get('days');
  const viewParam = searchParams.get('view');
  const range: FinanceRange = isFinanceRange(rangeParam) ? rangeParam : '30';
  const view: FinanceView = isFinanceView(viewParam) ? viewParam : 'charts';
  const days = Number(range);

  const handleRangeChange = (next: FinanceRange) => {
    setSearchParams(
      (params) => {
        params.set('days', next);
        return params;
      },
      { replace: true },
    );
  };

  const handleViewChange = (next: FinanceView) => {
    setSearchParams(
      (params) => {
        params.set('view', next);
        return params;
      },
      { replace: true },
    );
  };

  return (
    <>
      <SectionHeader
        title="Finance"
        subtitle="Where the money from every order goes"
        action={
          <div className={style['admin-finance-page__controls']}>
            <SegmentedTabs
              items={VIEW_ITEMS}
              value={view}
              onChange={handleViewChange}
              idPrefix="finance-view"
              ariaLabel="View"
              size="sm"
            />
            <SegmentedTabs
              items={RANGE_ITEMS}
              value={range}
              onChange={handleRangeChange}
              idPrefix="finance-range"
              ariaLabel="Finance period"
              size="sm"
            />
          </div>
        }
      />

      <AdminFinanceKpi days={days} />

      {view === 'charts' ? (
        <div className={style['admin-finance-page__grid']}>
          <div className={style['admin-finance-page__span-2']}>
            <AdminMoneyFlowPanel days={days} />
          </div>
          <div className={style['admin-finance-page__span-2']}>
            <AdminFinanceTrendPanel days={days} />
          </div>
          <AdminPaymentMethodsPanel days={days} />
          <AdminDeliveryPanel days={days} />
        </div>
      ) : (
        <AdminFinanceTable days={days} />
      )}
    </>
  );
};
