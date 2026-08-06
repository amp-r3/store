import { ProductSpecsSkeleton } from "./components";
import { ProductSummarySkeleton } from "@/widgets/product-summary";
import style from './productPage.module.scss'
import { ProductGallerySkeleton } from '@/widgets/product-gallery'
import { PageLayout, ShareCopyBtn, HOME_CRUMB, CATALOG_CRUMB } from '@/shared/ui'

export const ProductPageSkeleton = () => {

  return (
    <PageLayout breadcrumbs={[HOME_CRUMB, CATALOG_CRUMB, { label: '…' }]} actions={<ShareCopyBtn />}>
      <div className={style['layout']}>
        <div className={style['gallery-column']}>
          <ProductGallerySkeleton />
        </div>
        <div className={style['details-column']}>
          <ProductSummarySkeleton />
        </div>
      </div>

      <ProductSpecsSkeleton />
    </PageLayout>
  )
}