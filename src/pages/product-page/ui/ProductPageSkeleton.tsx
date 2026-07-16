import { ProductHeader, ProductSpecsSkeleton } from "./components";
import { ProductSummarySkeleton } from "@/widgets/product-summary";
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
            <ProductSummarySkeleton />
          </div>
        </div>

        <ProductSpecsSkeleton />
      </div>
    </main>
  )
}