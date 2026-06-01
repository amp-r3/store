import { ReactNode } from 'react'
import style from './auth-layout.module.scss'
import { Logo, ThemeToggle } from '@/components/common'
import { FaRegUser } from "react-icons/fa";

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  icon?: ReactNode
  isFullPage?: boolean
}

export const AuthLayout = ({ 
  title, 
  subtitle, 
  children, 
  icon = <FaRegUser />, 
  isFullPage = true 
}: AuthLayoutProps) => {
  const content = (
    <div className={style.card}>
      {isFullPage && (
        <div className={style.card__header}>
          <Logo />
          <ThemeToggle />
        </div>
      )}
      <div className={style.card__body}>
        <span className={style.card__icon}>
          {icon}
        </span>
        <h1 className={style.card__title}>{title}</h1>
        <p className={style.card__subtitle}>{subtitle}</p>
      </div>

      {children}
    </div>
  )

  if (!isFullPage) {
    return content;
  }

  return (
    <main className={style.root}>
      {content}

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