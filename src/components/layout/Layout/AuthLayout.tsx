import { ReactNode } from 'react'
import style from './auth-layout.module.scss'
import { BackButton } from '@/components/common'
import { useNavigate } from 'react-router'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  const navigate = useNavigate()
  return (
    <main className='container'>
      <BackButton onClick={() => navigate('/')} />
      <article className={style.pageWrapper}>
        <div className={style.card}>
          <div className={style.header}>
            <h1 className={style.title}>{title}</h1>
            {subtitle && <p className={style.subtitle}>{subtitle}</p>}
          </div>
          {children}
        </div>
      </article>
    </main>
  )
}