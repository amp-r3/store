import Skeleton from 'react-loading-skeleton'
import style from './product-gallery.module.scss'

export const ProductGallerySkeleton = () => {
  return (
    <div className={style['image-column']}>
      <div className={style['image-wrapper']}>
        <div style={{ position: 'absolute', inset: 0, padding: '1.5rem' }}>
          <Skeleton width="100%" height="100%" borderRadius={16} />
        </div>
      </div>
    </div>
  )
}
