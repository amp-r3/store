import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './product-item.module.scss';

const ProductItemSkeleton = () => {
  return (
    <article className={styles['product-item']}>

      <div className={styles['product-item__image-wrapper']}>
        <Skeleton width="100%" height="100%" />
      </div>

      <div className={styles['product-item__info']}>
        <Skeleton width={48} height={10} /> 
        <Skeleton width="75%" height={13} />
        <div className={styles['product-item__pricing']}>
          <Skeleton width={52} height={13} />
          <Skeleton width={36} height={10} /> 
        </div>
      </div>

      <div className={styles['product-item__meta']}>
        <Skeleton width={24} height={13} /> 
        <Skeleton width={56} height={16} /> 
      </div>

    </article>
  );
};

export default ProductItemSkeleton;