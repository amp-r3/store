import style from './productPage.module.scss'
import { ProductHeader } from './components/ProductHeader/ProductHeader'
import { ProductReviewsSkeleton } from './components/ProductReviews/ProductReviewsSkeleton'
import { ProductSpecsSkeleton } from './components/ProductSpecs/ProductSpecsSkeleton'
import { ProductPurchaseBoxSkeleton } from './components/ProductPurchaseBox/ProductPurchaseBoxSkeleton'
import { ProductInfoSkeleton } from './components/ProductInfo/ProductInfoSkeleton'
import { ProductGallerySkeleton } from './components/ProductGallery/ProductGallerySkeleton'
export const ProductPageSkeleton = () => {
  return (
    <main className={style['product-page']}>
      <div className="container">
        <ProductHeader onClick={() => { }} label='Back to catalog' />

        <div className={style['layout']}>
          <div className={style['gallery-column']}>
            <ProductGallerySkeleton />
          </div>
          <div className={style['details-column']}>
            <ProductInfoSkeleton />
            <ProductPurchaseBoxSkeleton />
          </div>
        </div>

        <ProductSpecsSkeleton />
        <ProductReviewsSkeleton />
      </div>
    </main>
  )
}