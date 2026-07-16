import { ProductHeader, ProductSpecsSkeleton, ProductSummaryBoxSkeleton } from "./components";
import style from './productPage.module.scss'
import { ProductGallerySkeleton } from '../../../widgets/product-gallery/ProductGallerySkeleton'
import { useMediaQuery } from "@/shared/lib/hooks";

export const ProductPageSkeleton = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <main className={style['product-page']}>
      <div className="container">
        <ProductHeader onClick={() => { }} label='Back to catalog' />

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