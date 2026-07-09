import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './order-details-skeleton.module.scss';
import { OrderItemSkeleton } from '../OrderItem/OrderItemSkeleton';

export const OrderDetailsSkeleton: FC = () => {
    return (
        <section className={style['order-card']} aria-label="Loading order details">
            {/* ── HEADER ── */}
            <header className={style['header']} aria-label="Loading order details header">
                <div className={style['header__main']}>
                    <div className={style['header__title-group']}>
                        <Skeleton 
                            width={120} 
                            height={28} 
                            borderRadius={6} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                    <div className={style['header__meta']}>
                        <Skeleton 
                            width={90} 
                            height={14} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                </div>
                <div className={style['header__badges']}>
                    <Skeleton 
                        width={80} 
                        height={24} 
                        borderRadius={12} 
                        baseColor="var(--skeleton-base)"
                        highlightColor="var(--skeleton-highlight)"
                    />
                </div>
            </header>

            {/* ── BODY ── */}
            <div className={style['body']}>
                <div className={style['body__info-grid']}>
                    {/* Delivery Info Card Skeleton */}
                    <div className={style['info-card']}>
                        <div className={style['info-card__header']}>
                            <Skeleton 
                                circle 
                                width={24} 
                                height={24} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                            <Skeleton 
                                width={100} 
                                height={18} 
                                borderRadius={4} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                        </div>
                        <div className={style['info-card__content']}>
                            <Skeleton 
                                width={140} 
                                height={16} 
                                borderRadius={4} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                            <Skeleton 
                                width={120} 
                                height={20} 
                                borderRadius={10} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                            <Skeleton 
                                width="90%" 
                                height={14} 
                                borderRadius={4} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                        </div>
                    </div>

                    {/* Payment Info Card Skeleton */}
                    <div className={style['info-card']}>
                        <div className={style['info-card__header']}>
                            <Skeleton 
                                circle 
                                width={24} 
                                height={24} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                            <Skeleton 
                                width={100} 
                                height={18} 
                                borderRadius={4} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                        </div>
                        <div className={style['info-card__content']}>
                            <Skeleton 
                                width={140} 
                                height={16} 
                                borderRadius={4} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                            <Skeleton 
                                width={120} 
                                height={20} 
                                borderRadius={10} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                        </div>
                    </div>
                </div>

                <div className={style['body__items-section']}>
                    <div className={style['body__section-header']}>
                        <Skeleton 
                            width={80} 
                            height={20} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                        <Skeleton 
                            width={60} 
                            height={16} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                    <div className={style['body__scroll-area']}>
                        <div className={style['body__list']}>
                            <OrderItemSkeleton count={3} />
                        </div>
                    </div>
                </div>

                <div className={style['body__receipt']}>
                    <div className={style['body__receipt-row']}>
                        <Skeleton 
                            width={100} 
                            height={16} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                        <Skeleton 
                            width={60} 
                            height={16} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                    <div className={style['body__receipt-row']}>
                        <Skeleton 
                            width={80} 
                            height={16} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                        <Skeleton 
                            width={50} 
                            height={16} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer className={style['footer']}>
                <div className={style['footer__summary']}>
                    <div className={style['footer__summary-row']}>
                        <Skeleton 
                            width={60} 
                            height={20} 
                            borderRadius={4} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                        <div className={style['footer__total-price-wrapper']}>
                            <Skeleton 
                                width={100} 
                                height={28} 
                                borderRadius={6} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                            <Skeleton 
                                width={70} 
                                height={14} 
                                borderRadius={4} 
                                baseColor="var(--skeleton-base)"
                                highlightColor="var(--skeleton-highlight)"
                            />
                        </div>
                    </div>
                </div>

                <div className={style['footer__btn-container']}>
                    <div style={{ flex: 1 }}>
                        <Skeleton 
                            height={44} 
                            borderRadius={8} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Skeleton 
                            height={44} 
                            borderRadius={8} 
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                </div>
            </footer>
        </section>
    );
};
