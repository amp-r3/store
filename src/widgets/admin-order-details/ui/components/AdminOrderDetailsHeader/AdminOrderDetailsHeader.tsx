import { FC, useEffect, useRef, useState } from 'react';
import {
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCalendar,
} from 'react-icons/hi2';
import style from './admin-order-details-header.module.scss';
import { OrderStatus, ORDER_STATUS_MAP } from '@/entities/order';
import { formatDate } from '@/shared/lib';
import { StatusBadge } from '@/shared/ui';

interface AdminOrderDetailsHeaderProps {
  orderId: string;
  orderStatus: OrderStatus;
  orderDate: string;
  updatedDate: string;
  isFetching: boolean;
}

export const AdminOrderDetailsHeader: FC<AdminOrderDetailsHeaderProps> = ({
  orderId,
  orderStatus,
  orderDate,
  updatedDate,
  isFetching,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setIsCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <header className={style['header']} aria-label="Order details header">
      <div className={style['header__main']}>
        <div className={style['header__title-group']}>
          <h2 className={style['header__title']}>
            <span className="sr-only">Order ID </span>#{orderId}
          </h2>
          <button
            type="button"
            onClick={handleCopyId}
            className={style['header__copy-btn']}
            aria-label={isCopied ? 'Order ID copied to clipboard' : 'Copy Order ID to clipboard'}
            title="Copy Order ID"
          >
            {isCopied ? (
              <HiOutlineClipboardDocumentCheck
                className={style['header__copy-icon--success']}
                aria-hidden="true"
              />
            ) : (
              <HiOutlineClipboardDocument aria-hidden="true" />
            )}
          </button>
        </div>

        <div className={style['header__meta']}>
          <HiOutlineCalendar className={style['header__meta-icon']} aria-hidden="true" />
          <span>
            <span className="sr-only">Placed </span>
            <time dateTime={orderDate}>{formatDate(orderDate, 'full')}</time>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <span className="sr-only">Last updated </span>
            <time dateTime={updatedDate}>{formatDate(updatedDate, 'full')}</time>
          </span>
        </div>
      </div>

      <div className={style['header__badges']}>
        {isFetching && (
          <div className={style['header__badge-update']} aria-live="polite" role="status">
            <span className="sr-only">Order data is </span>
            Updating...
          </div>
        )}
        <StatusBadge
          status={orderStatus}
          label={ORDER_STATUS_MAP[orderStatus]?.label ?? orderStatus}
          ariaLabel={`Order status: ${ORDER_STATUS_MAP[orderStatus]?.label ?? orderStatus}`}
        />
      </div>
    </header>
  );
};
