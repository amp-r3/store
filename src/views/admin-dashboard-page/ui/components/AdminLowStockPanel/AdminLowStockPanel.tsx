import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { LuPackageOpen } from 'react-icons/lu';

import { useGetAdminLowStockQuery } from '@/entities/admin';
import { Alert, EmptyState, PanelCard } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';

import style from './admin-low-stock-panel.module.scss';

const LOW_STOCK_THRESHOLD = 5;
const LOW_STOCK_LIMIT = 5;

export const AdminLowStockPanel = () => {
  const { data, isLoading, error } = useGetAdminLowStockQuery({
    threshold: LOW_STOCK_THRESHOLD,
    limit: LOW_STOCK_LIMIT,
  });
  const items = data ?? [];

  return (
    <PanelCard title="Low stock" to="/admin/products/low-stock">
      {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {isLoading ? (
        <div className={style['admin-low-stock-panel__list']}>
          {Array.from({ length: LOW_STOCK_LIMIT }).map((_, index) => (
            <div key={index} className={style['admin-low-stock-panel__row']}>
              <Skeleton width={40} height={40} borderRadius={8} />
              <Skeleton width={140} height={16} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<LuPackageOpen />}
          title="Stock levels look healthy"
          text="No size is at or below 5 units right now."
        />
      ) : (
        <div className={style['admin-low-stock-panel__list']}>
          {items.map((item) => (
            <Link
              key={item.sizeId}
              href={`/admin/products/${item.productId}/edit`}
              className={style['admin-low-stock-panel__row']}
            >
              {item.thumbnail && (
                <Image
                  className={style['admin-low-stock-panel__thumbnail']}
                  src={item.thumbnail}
                  alt=""
                  aria-hidden="true"
                  width={40}
                  height={40}
                />
              )}
              <span className={style['admin-low-stock-panel__title']}>{item.title}</span>
              <span className={style['admin-low-stock-panel__size']}>{item.value}</span>
              <span
                className={`${style['admin-low-stock-panel__stock']} ${item.stock === 0 ? style['admin-low-stock-panel__stock--empty'] : style['admin-low-stock-panel__stock--low']}`}
              >
                {item.stock}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PanelCard>
  );
};
