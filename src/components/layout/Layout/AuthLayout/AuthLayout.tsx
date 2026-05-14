import { ReactNode } from 'react'
import style from './auth-layout.module.scss'
import { Logo, ThemeToggle } from '@/components/common'
import { FaRegUser } from "react-icons/fa";

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <main className={style.root}>
      <div className={style.card}>
        <div className={style.card__header}>
          <Logo />
          <ThemeToggle />
        </div>
        <div className={style.card__body}>
          <span className={style.card__icon}>
            <FaRegUser />
          </span>
          <h1 className={style.card__title}>{title}</h1>
          <p className={style.card__subtitle}>{subtitle}</p>
        </div>

        {children}
      </div>

      <footer className={style.footer}>
        <p>
          By continuing, you agree to our{' '}
          <a href="" className={style.link}>Terms of Service</a> and{' '}
          <a href="" className={style.link}>Privacy Policy</a>.
        </p>
      </footer>
    </main>
  )
}