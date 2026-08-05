import { FC, useId, useMemo, useState } from 'react';
import { LuChevronDown, LuCheck, LuTriangleAlert } from 'react-icons/lu';
import { Order, OrderStatusEvent } from '@/entities/order/model/types';
import { buildOrderProgress } from '@/entities/order/lib/buildOrderProgress';
import { formatDate } from '@/shared/lib';
import { useHaptics } from '@/shared/lib/hooks';
import { OrderProgressSkeleton } from './OrderProgressSkeleton';
import style from './order-progress.module.scss';

interface OrderProgressProps {
  order: Order;
  events: OrderStatusEvent[];
  isLoading: boolean;
}

export const OrderProgress: FC<OrderProgressProps> = ({ order, events, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { light } = useHaptics();
  const panelId = useId();

  const progress = useMemo(() => buildOrderProgress(order, events), [order, events]);
  const currentNode = progress.nodes.find((node) => node.state === 'current') ?? progress.nodes[progress.nodes.length - 1];

  const toggle = () => {
    light();
    setIsOpen((open) => !open);
  };

  if (isLoading) {
    return <OrderProgressSkeleton />;
  }

  return (
    <section className={style['progress']} data-derailed={progress.isDerailed ? 'true' : undefined} aria-label="Order progress">
      <button
        type="button"
        className={style['progress__bar']}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        {/* Decorative summary of the panel below — every step/date is announced from the expanded list, not repeated here. */}
        <ol className={style['progress__rail']} aria-hidden="true">
          {progress.nodes.map((node) => (
            <li key={node.status} data-state={node.state} className={style['progress__dot']} />
          ))}
        </ol>
        <span className={style['progress__current']}>{currentNode?.label}</span>
        <LuChevronDown
          className={`${style['progress__chevron']} ${isOpen ? style['progress__chevron--expanded'] : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        className={`${style['progress__panel']} ${isOpen ? style['progress__panel--expanded'] : ''}`}
      >
        <div className={style['progress__inner']}>
          <div className={style['progress__scroll']}>
            <ol className={style['progress__timeline']}>
              {progress.nodes.map((node) => (
                <li
                  key={node.status}
                  data-state={node.state}
                  data-terminal={node.isTerminalNegative ? 'true' : undefined}
                  className={style['progress__step']}
                >
                  <span className={style['progress__rail-col']}>
                    <span className={style['progress__marker']}>
                      {node.isTerminalNegative ? (
                        <LuTriangleAlert aria-hidden="true" />
                      ) : node.state === 'done' ? (
                        <LuCheck aria-hidden="true" />
                      ) : (
                        node.icon
                      )}
                    </span>
                    <span className={style['progress__line']} />
                  </span>

                  <span className={style['progress__main']}>
                    <span className={style['progress__label']}>{node.label}</span>
                    {node.at ? (
                      <time dateTime={node.at} className={style['progress__time']}>
                        {formatDate(node.at, 'full')}
                      </time>
                    ) : (
                      <span className={style['progress__time']} aria-hidden="true">—</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
