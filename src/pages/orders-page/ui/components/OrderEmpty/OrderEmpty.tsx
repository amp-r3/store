import { Breadcrumbs } from "@/shared/ui"
import { Header } from "@/widgets/header"
import { useNavigate } from "react-router"
import style from './order-empty.module.scss'

export const OrderEmpty = () => {
  const navigate = useNavigate()
  return (
    <div className={style['empty']}>
      <Header />
      <div className={style['empty__container'] + ' container'}>
        <div className={style['empty__header']}>
          <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Orders' }]} />
        </div>
        <div className={style.emptyState}>
          <span className={style.emptyStateIcon}>📦</span>
          <p className={style.emptyStateTitle}>No orders yet</p>
          <p className={style.emptyStateText}>Your completed orders will appear here.</p>
        </div>
      </div>
    </div>
  )
}