import { ProductHeader, ProductSpecsSkeleton, ProductSummaryBoxSkeleton } from "./components";
import style from './productPage.module.scss'
import { ProductGallerySkeleton } from '@/widgets/product-gallery'
export const ProductPageSkeleton = () => {

  return (
    <main className={style['product-page']}>
      <div className="container">
        <ProductHeader category='...' title='...' />

        <div className={style['layout']}>
          <div className={style['gallery-column']}>
            <ProductGallerySkeleton />
          </div>
          <div className={style['details-column']}>
            <ProductSummaryBoxSkeleton />
          </div>
        </div>

        <ProductSpecsSkeleton />
      </div>
    </main>
  )
}