
import Skeleton from 'react-loading-skeleton'
import style from './product-specs.module.scss'


export const ProductSpecsSkeleton = () => {

  const SpecRow = () => (
    <div className={style['spec-row']}>
      <span className={style['spec-icon']}>
        <Skeleton width={28} height={28} />
      </span>
      <span className={style['spec-label']}><Skeleton width={40} /></span>
      <span className={style['spec-value']}><Skeleton width={120} /></span>
    </div>
  );
  return (
    <section className={style['specs-section']}>
      <h2 className={style['specs-title']}>Specifications</h2>

      <div className={style['specs-grid']}>
        <div className={style['specs-group']}>
          <span className={style['specs-group-label']}>
            <Skeleton width={80} />
          </span>
          <SpecRow />
          <SpecRow />
          <SpecRow />
        </div>

        <div className={style['specs-group']}>
          <span className={style['specs-group-label']}>
            <Skeleton width={70} />
          </span>
          <SpecRow />
          <SpecRow />
          <SpecRow />
        </div>
      </div>
    </section>
  )
}
