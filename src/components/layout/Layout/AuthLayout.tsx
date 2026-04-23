import { ReactNode } from 'react'
import style from './auth-layout.module.scss'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <div className={style.pageWrapper}>
      <div className={style.card}>
        <div className={style.header}>
          <h1 className={style.title}>{title}</h1>
          {subtitle && <p className={style.subtitle}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}