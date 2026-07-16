
import { ProductSizesSkeleton } from './components/ProductSizes/ProductSizesSkeleton';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './product-summary.module.scss';

export const ProductSummarySkeleton = () => {
    return (
        <aside className={styles.summary}>
            <div className={styles.content}>
                <div className={styles.info}>
                    <Skeleton height={32} width="80%" className={styles.title} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                    <Skeleton height={24} width="40%" className={styles.price} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                    <ProductSizesSkeleton />
                </div>
                <div className={styles.purchase}>
                    <Skeleton height={48} width="100%" className={styles.button} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                    <Skeleton height={48} width="100%" className={styles.button} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                </div>
            </div>
        </aside>
    );
};
