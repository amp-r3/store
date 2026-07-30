import { ReactNode } from 'react'
import style from './auth-card.module.scss'
import { Logo } from '../logo/Logo'
import { FaRegUser } from 'react-icons/fa'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  icon?: ReactNode
}

export const AuthCard = ({ title, subtitle, children, icon = <FaRegUser /> }: AuthCardProps) => (
  <main className={style.root}>
    <div className={style.card}>
      <div className={style.card__inner}>
        <div className={style.card__header}>
          <Logo />
        </div>

        <div className={style.card__body}>
          <span className={style.card__icon}>{icon}</span>
          <h1 className={style.card__title}>{title}</h1>
          {subtitle && <p className={style.card__subtitle}>{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>

    <footer className={style.footer}>
      {/* No Terms of Service / Privacy Policy pages exist yet — plain text
          until those routes exist, then this becomes a <Link>. */}
      <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
    </footer>
  </main>
)
