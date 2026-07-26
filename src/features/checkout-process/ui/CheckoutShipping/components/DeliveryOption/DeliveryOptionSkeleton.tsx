import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from './delivery-option.module.scss';

export const DeliveryOptionSkeleton = () => {
  return (
    <div className={style['delivery-option']}>

      <Skeleton circle width={18} height={18} />

      <div className={style['delivery-option__info']}>
        <Skeleton width={100} height={13} /> 
        <Skeleton width={72} height={11} />  
      </div>

      <Skeleton width={40} height={13} />

    </div>
  );
};