import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './payment-option.module.scss';

export const PaymentOptionSkeleton = () => {
  return (
    <div className={style['payment__option']}>
      <Skeleton width={36} height={36} borderRadius={6} />
      <Skeleton width={52} height={11} />                 
    </div>
  );
};