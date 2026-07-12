import { BackButton } from "@/shared/ui"
import style from './order-empty.module.scss'
import { useNavigate } from "react-router"

export const OrderEmpty = () => {
  const navigate = useNavigate()
  return (
    <main className="container">
      <BackButton onClick={() => navigate(-1)} />
      <div className={style.emptyState}>
        <span className={style.emptyStateIcon}>📦</span>
        <p className={style.emptyStateTitle}>No orders yet</p>
        <p className={style.emptyStateText}>Your completed orders will appear here.</p>
      </div>
    </main>
  )
}