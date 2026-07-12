import Skeleton from 'react-loading-skeleton'
import style from './control-panel.module.scss'
export const ControlPanelSkeleton = () => {
  return (
    <div className={style['control-panel']}>
      <div className={style['control-panel__group']}>
        <div className={style['control-panel__btn']}>
          <Skeleton width={110} height={20} />
        </div>

        <div className={style['control-panel__btn']}>
          <Skeleton width={140} height={20} />
        </div>
      </div>
    </div>
  )
}